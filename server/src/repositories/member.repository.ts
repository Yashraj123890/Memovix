import prisma from "../lib/prisma";
import { InvitationStatus } from "@prisma/client";

export class MemberRepository {

    async create(data: {
        email: string;
        token: string;
        tenantId: string;
        invitedById: string;
        expiresAt: Date;
    }) {
        return prisma.memberInvitation.create({
            data: {
                email: data.email,
                token: data.token,
                tenantId: data.tenantId,
                invitedById: data.invitedById,
                expiresAt: data.expiresAt,
                status: InvitationStatus.PENDING
            }
        });
    }

    async findByToken(token: string) {
        return prisma.memberInvitation.findUnique({
            where: {
                token
            }
        });
    }

    async findByEmail(email: string, tenantId: string) {
        return prisma.memberInvitation.findFirst({
            where: {
                email,
                tenantId
            }
        });
    }

    async updateStatus(id: string, status: InvitationStatus) {
        return prisma.memberInvitation.update({
            where: {
                id
            },
            data: {
                status
            }
        });
    }

    async markAccepted(id: string) {
        return prisma.memberInvitation.update({
            where: {
                id
            },
            data: {
                status: InvitationStatus.ACCEPTED,
                acceptedAt: new Date()
            }
        });
    }

    async delete(id: string) {
        return prisma.memberInvitation.delete({
            where: {
                id
            }
        });
    }

    async getTenantInvitations(tenantId: string) {
        return prisma.memberInvitation.findMany({
            where: {
                tenantId
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }
    async getWorkspaceMembers(tenantId: string) {
    return prisma.user.findMany({
        where: {
            tenantId,
            role: {
                in: ["OWNER", "MEMBER"],
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}
}