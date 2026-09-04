import prisma from "../lib/prisma";

export class CommentRepository {
    async create(data: {
        content: string;
        memoryId?: string;
        fileId?: string;
        userId: string;
    }) {
        return prisma.comment.create({
            data,
        });
    }

    async findByMemory(memoryId: string) {
        return prisma.comment.findMany({
            where: {
                memoryId,
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
                createdAt: "asc",
            },
        });
    }

    async findByFile(fileId: string) {
        return prisma.comment.findMany({
            where: {
                fileId,
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
                createdAt: "asc",
            },
        });
    }

  async findById(commentId: string) {
    return prisma.comment.findUnique({
        where: {
            id: commentId,
        },
        include: {
            memory: {
                select: {
                    projectId: true,
                },
            },
            file: {
                select: {
                    projectId: true,
                },
            },
        },
    });
}

    async update(commentId: string, content: string) {
        return prisma.comment.update({
            where: {
                id: commentId,
            },
            data: {
                content,
            },
        });
    }

    async delete(commentId: string) {
        return prisma.comment.delete({
            where: {
                id: commentId,
            },
        });
    }
}