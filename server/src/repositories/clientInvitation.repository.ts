import prisma from "../lib/prisma";
import { InvitationStatus } from "@prisma/client";

export class ClientInvitationRepository {
    async create(data: {
        email: string;
        token: string;
        tenantId: string;
        projectId: string;
        invitedById: string;
        expiresAt: Date;
    }) {
        return prisma.clientInvitation.create({
            data,
        });
    }

    async findByToken(token: string) {
        // Runs PRE-AUTH (POST /client/register carries no tenant context), so it
        // must not include RLS-STRICT relations. `project` is strict under RLS —
        // with no context it resolves to null and Prisma throws "Field project is
        // required to return data, got null". registerClient only reads invitation
        // scalar fields (tenantId, projectId, email, id, status, expiresAt), so the
        // project include was unused dead weight. tenant/invitedBy are permissive
        // and safe pre-auth. (M9 Phase 3 hotfix — see rls-tenant-mapping.md.)
        return prisma.clientInvitation.findUnique({
            where: {
                token,
            },
            include: {
                tenant: true,
                invitedBy: true,
            },
        });
    }

    async findPendingInvitation(
        email: string,
        projectId: string
    ) {
        return prisma.clientInvitation.findFirst({
            where: {
                email,
                projectId,
                status: InvitationStatus.PENDING,
            },
        });
    }

    async markAccepted(id: string) {
        return prisma.clientInvitation.update({
            where: {
                id,
            },
            data: {
                status: InvitationStatus.ACCEPTED,
                acceptedAt: new Date(),
            },
        });
    }

    async expireInvitation(id: string) {
        return prisma.clientInvitation.update({
            where: {
                id,
            },
            data: {
                status: InvitationStatus.EXPIRED,
            },
        });
    }
    async findPendingByProject(projectId: string) {
    return prisma.clientInvitation.findMany({
        where: {
            projectId,
            status: "PENDING",
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async delete(id: string) {
    return prisma.clientInvitation.delete({
        where: {
            id,
        },
    });
}
}