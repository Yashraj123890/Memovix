import crypto from "crypto";
import { InvitationStatus } from "@prisma/client";

import { MemberRepository } from "../repositories/member.repository";
import { AuthRepository } from "../repositories/auth.repository";

import { hashPassword } from "../auth/password";
import { sessionService } from "./session.service";

import notificationService from "./notification.service";
import { NotificationType } from "@prisma/client";
import auditService from "./audit.service";
import { ProjectMemberService } from "./projectMember.service";

import { EmailService } from "./email/email.service";
import { env } from "../config/env";

const memberRepository = new MemberRepository();
const authRepository = new AuthRepository();
const projectMemberService = new ProjectMemberService();
const emailService = new EmailService();
export class MemberService {

    async inviteMember(
        email: string,
        tenantId: string,
        invitedById: string
    ) {

        const existingInvitation =
            await memberRepository.findByEmail(email, tenantId);

        if (
            existingInvitation &&
            existingInvitation.status === InvitationStatus.PENDING
        ) {
            throw new Error("An active invitation already exists.");
        }

        const existingUser =
            await authRepository.findUserByEmail(email);

        if (existingUser) {
            throw new Error("A user with this email already exists.");
        }

        const token = crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation =
            await memberRepository.create({
                email,
                token,
                tenantId,
                invitedById,
                expiresAt
            });
            const inviteLink = `${env.FRONTEND_URL}/member/register/${token}`;

await emailService.sendMemberInvitation({
    to: email,
    invitedBy: "Workspace Owner",
    workspaceName: "Memovix Workspace",
    inviteLink,
});
await notificationService.createNotification({
    userId: invitedById,
    type: NotificationType.MEMBER_INVITED,
    title: "Member Invited",
    message: `Invitation sent to ${email}.`,
});
await auditService.createLog({
    tenantId,
    userId: invitedById,

    action: "MEMBER_INVITED",

    entityType: "MEMBER_INVITATION",
    entityId: invitation.id,

    details: {
        email: invitation.email,
        status: invitation.status,
    },
});
        return {
    message: "Invitation created successfully.",
    inviteLink,
    invitation
};
    }

    async registerFromInvitation(
        token: string,
        name: string,
        password: string
    ) {

        const invitation =
            await memberRepository.findByToken(token);

        if (!invitation) {
            throw new Error("Invitation not found.");
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new Error("Invitation has already been used.");
        }

        if (new Date() > invitation.expiresAt) {

            await memberRepository.updateStatus(
                invitation.id,
                InvitationStatus.EXPIRED
            );

            throw new Error("Invitation has expired.");
        }

        const existingUser =
            await authRepository.findUserByEmail(
                invitation.email
            );

        if (existingUser) {
            throw new Error("User already exists.");
        }

        const passwordHash =
            await hashPassword(password);

        const member =
            await authRepository.createMember({
                tenantId: invitation.tenantId,
                name,
                email: invitation.email,
                passwordHash
            });

        await memberRepository.markAccepted(
            invitation.id
        );

        const { accessToken, refreshToken } = await sessionService.issue({
            userId: member.id,
            tenantId: member.tenantId,
            role: member.role
        });

await emailService.sendWelcomeEmail({
    to: member.email,
    name: member.name,
    role: "Member",
});
        const { passwordHash: _, ...safeMember } = member;

        return {
            message: "Member registered successfully.",
            user: safeMember,
            accessToken,
            refreshToken
        };
    }

    async getInvitations(
        tenantId: string
    ) {

        return memberRepository.getTenantInvitations(
            tenantId
        );
    }

    async deleteInvitation(
        id: string
    ) {

        return memberRepository.delete(id);
    }
async getWorkspaceMembers(
    tenantId: string
) {
    return memberRepository.getWorkspaceMembers(
        tenantId
    );
}
}