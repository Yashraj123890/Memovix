import prisma from "../lib/prisma";
import { ProjectStatus } from "@prisma/client";


export class ProjectRepository {
    async create(data: {
        tenantId: string;
        ownerId: string;
        name: string;
        description?: string;
    }) {
        return prisma.project.create({
            data: {
                tenantId: data.tenantId,
                ownerId: data.ownerId,
                name: data.name,
                description: data.description,
            },
        });
    }

    async findAllByTenant(tenantId: string) {
        return prisma.project.findMany({
            where: {
                tenantId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findById(projectId: string, tenantId: string) {
        return prisma.project.findFirst({
            where: {
                id: projectId,
                tenantId,
            },
        });
    }

    async update(
        projectId: string,
        tenantId: string,
        data: {
            name?: string;
            description?: string;
            status?: ProjectStatus;
        }
    ) {
        return prisma.project.updateMany({
            where: {
                id: projectId,
                tenantId,
            },
            data,
        });
    }

    async delete(projectId: string, tenantId: string) {
        return prisma.project.deleteMany({
            where: {
                id: projectId,
                tenantId,
            },
        });
    }
}