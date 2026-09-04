import prisma from "../lib/prisma";

export class AuditRepository {

    async create(data: {
        tenantId: string;
        userId?: string;
        projectId?: string;
        action: string;
        entityType: string;
        entityId?: string;
        details?: any;
    }) {

        return prisma.auditLog.create({
            data,
        });

    }

    async findByProject(projectId: string) {

        return prisma.auditLog.findMany({
            where: {
                projectId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

    }

    async findByTenant(tenantId: string) {

        return prisma.auditLog.findMany({
            where: {
                tenantId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

    }

}