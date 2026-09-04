import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import {
    UserRole,
    InvitationStatus,
    NotificationType,
} from "@prisma/client";
import crypto from "crypto";

import { ClientInvitationRepository } from "../repositories/clientInvitation.repository";
import { ProjectClientRepository } from "../repositories/projectClient.repository";
import { AuthRepository } from "../repositories/auth.repository";

import { ClientRegisterDto } from "../types/client-register";

import notificationService from "./notification.service";
import auditService from "./audit.service";

import { EmailService } from "./email/email.service";
import { sessionService } from "./session.service";
import { env } from "../config/env";
 
export class ClientInvitationService {
    private invitationRepository = new ClientInvitationRepository();
private authRepository = new AuthRepository();
private projectClientRepository = new ProjectClientRepository();
private emailService = new EmailService();

    async inviteClient(
        ownerId: string,
        projectId: string,
        email: string
    ) {
        // 1. Verify project exists

        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
        });

        if (!project) {
            throw new Error("Project not found");
        }

        // 2. Verify ownership

        if (project.ownerId !== ownerId) {
            throw new Error(
                "Only the project owner can invite clients."
            );
        }

        // 3. Prevent duplicate active invitation

        const existing =
            await this.invitationRepository.findPendingInvitation(
                email,
                projectId
            );

        if (existing) {
            throw new Error(
                "A pending invitation already exists."
            );
        }

        // 4. Generate secure token

        const token = crypto.randomBytes(32).toString("hex");

        // 5. Expiration (7 days)

        const expiresAt = new Date();

        expiresAt.setDate(expiresAt.getDate() + 7);

        // 6. Save invitation

       const invitation =
    await this.invitationRepository.create({
                email,
                token,
                tenantId: project.tenantId,
                projectId,
                invitedById: ownerId,
                expiresAt,
            });
            const inviteLink = `${env.FRONTEND_URL}/client/register/${token}`;

await this.emailService.sendClientInvitation({
    to: email,
    invitedBy: "Workspace Owner",
    companyName: "Memovix Workspace",
    projectName: project.name,
    inviteLink,
});
await notificationService.createNotification({
    userId: ownerId,
    projectId,
    type: NotificationType.CLIENT_INVITED,
    title: "Client Invited",
    message: `Invitation sent to ${email}.`,
});

await auditService.createLog({
    tenantId: project.tenantId,
    userId: ownerId,
    projectId,

    action: "CLIENT_INVITED",

    entityType: "CLIENT_INVITATION",
    entityId: invitation.id,

    details: {
        email: invitation.email,
        status: invitation.status,
    },
});
      return {
    message: "Client invited successfully.",
    inviteLink,
    invitation,
};
    }
    async registerClient(data: ClientRegisterDto) {
    // Step 1: Find invitation
    const invitation = await this.invitationRepository.findByToken(data.token);

    if (!invitation) {
        throw new Error("Invalid invitation token.");
    }

    // Step 2: Check status
    if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error("Invitation has already been used.");
    }

    // Step 3: Check expiry
    if (invitation.expiresAt < new Date()) {
        await this.invitationRepository.expireInvitation(invitation.id);
        throw new Error("Invitation has expired.");
    }

    // Step 4: Resolve identity (M11 — registration reuse as idempotent linking).
    // Reuse an existing CLIENT and add only the missing membership; create a new
    // CLIENT for an unknown email. Callers get the same result shape either way.
    const existingUser = await this.authRepository.findUserByEmail(
        invitation.email
    );

    if (existingUser) {
        // Only CLIENT identities may join additional workspaces. An OWNER/MEMBER
        // email is a fixed single-workspace identity — never reuse it here.
        if (existingUser.role !== UserRole.CLIENT) {
            throw new Error(
                "This email is already registered to a workspace account and cannot join as a client."
            );
        }
        if (!existingUser.isActive) {
            throw new Error("Account is disabled.");
        }
        // "Log in to accept": prove ownership of the existing account. We never
        // reset an existing account's password via an invitation token.
        const validPassword = await bcrypt.compare(
            data.password,
            existingUser.passwordHash
        );
        if (!validPassword) {
            throw new Error("Incorrect password for the existing account.");
        }
    }

    // Only new accounts need a password hash; reused accounts keep their own.
    const passwordHash = existingUser
        ? null
        : await bcrypt.hash(data.password, 10);

    // Step 5: Idempotent link — create the CLIENT user if new, upsert the
    // project_clients membership (no duplicate if already linked), and consume
    // the single-use invitation. Pre-auth flow (no tenant context): the
    // permissive RLS policies on users/project_clients/client_invitations allow
    // these writes.
    const client = await prisma.$transaction(async (tx) => {
        const user =
            existingUser ??
            (await tx.user.create({
                data: {
                    tenantId: invitation.tenantId,
                    name: data.name,
                    email: invitation.email,
                    passwordHash: passwordHash as string,
                    role: UserRole.CLIENT,
                },
            }));

        await tx.projectClient.upsert({
            where: {
                projectId_clientId: {
                    projectId: invitation.projectId,
                    clientId: user.id,
                },
            },
            create: {
                projectId: invitation.projectId,
                clientId: user.id,
            },
            update: {},
        });

        await tx.clientInvitation.update({
            where: { id: invitation.id },
            data: {
                status: InvitationStatus.ACCEPTED,
                acceptedAt: new Date(),
            },
        });

        return user;
    });

    // Welcome only newly-created accounts (a reused client already has one).
    if (!existingUser) {
        await this.emailService.sendWelcomeEmail({
            to: client.email,
            name: client.name,
            role: "Client",
        });
    }

    // Step 6: Issue the access + refresh session via the shared SessionService
    // so this flow uses the exact same token system as login/register/member
    // acceptance (blueprint §13.1). The controller sets the refresh cookie.
    // M11 (Phase 3): open the session in the workspace just joined, and persist
    // it as the session's active workspace so refresh keeps it.
    const { accessToken, refreshToken } = await sessionService.issue(
        { userId: client.id, tenantId: invitation.tenantId, role: client.role },
        { activeTenantId: invitation.tenantId },
    );

    return {
        user: {
            id: client.id,
            name: client.name,
            email: client.email,
            role: client.role,
        },
        accessToken,
        refreshToken,
    };
}
async getPendingInvitations(projectId: string) {
    return this.invitationRepository.findPendingByProject(
    projectId
);
}
    async cancelInvitation(invitationId: string) {
  await this.invitationRepository.delete(
    invitationId
);

    return {
        message: "Client invitation cancelled successfully.",
    };
}
}