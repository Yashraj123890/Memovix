import prisma from "../lib/prisma";

export class ProjectClientRepository {
    async create(projectId: string, clientId: string) {
        return prisma.projectClient.create({
            data: {
                projectId,
                clientId,
            },
        });
    }

    async findByProject(projectId: string) {
        return prisma.projectClient.findMany({
            where: {
                projectId,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findClientProjects(clientId: string) {
        return prisma.projectClient.findMany({
            where: {
                clientId,
            },
            include: {
                project: true,
            },
        });
    }

    async exists(projectId: string, clientId: string) {
        return prisma.projectClient.findUnique({
            where: {
                projectId_clientId: {
                    projectId,
                    clientId,
                },
            },
        });
    }

    async remove(projectId: string, clientId: string) {
        return prisma.projectClient.delete({
            where: {
                projectId_clientId: {
                    projectId,
                    clientId,
                },
            },
        });
    }
async getProjectsForClient(
    clientId: string,
    tenantId: string
) {
    const assignments = await prisma.projectClient.findMany({
        where: {
            clientId,
            project: {
                tenantId,
            },
        },
        include: {
            project: true,
        },
    });

    return assignments.map((assignment) => assignment.project);
}

async findClientProject(
    clientId: string,
    projectId: string
) {
    return prisma.projectClient.findUnique({
        where: {
            projectId_clientId: {
                projectId,
                clientId,
            },
        },
        include: {
            project: true,
        },
    });
}
}