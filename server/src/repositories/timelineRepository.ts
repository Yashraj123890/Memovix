import prisma from "../lib/prisma";

export class TimelineRepository {
    async create(data: {
        projectId: string;
        userId?: string;
        action: string;
        description: string;
    }) {
        return prisma.timeline.create({
            data,
        });
    }

    async findAllByProject(projectId: string) {
        return prisma.timeline.findMany({
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
}