import prisma from "../lib/prisma";
import { MemoryCategory } from "@prisma/client";

export class MemoryRepository {

    async create(data: {
        title: string;
        content: string;
        category: MemoryCategory;
        customCategory?: string | null;
        projectId: string;
        createdById: string;
    }) {
        return prisma.memory.create({
            data: {
                title: data.title,
                content: data.content,
                category: data.category,
                customCategory: data.customCategory,
                projectId: data.projectId,
                createdById: data.createdById,
            },
        });
    }

    async findAllByProject(projectId: string) {
        return prisma.memory.findMany({
            where: {
                projectId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findById(memoryId: string) {
        return prisma.memory.findUnique({
            where: {
                id: memoryId,
            },
        });
    }

    async update(
        memoryId: string,
        data: {
            title?: string;
            content?: string;
            category?: MemoryCategory;
            customCategory?: string | null;
        }
    ) {
        console.log("Repository update data:", data);
        return prisma.memory.update({
            where: {
                id: memoryId,
            },
            data,
        });
    }

    async delete(memoryId: string) {
        return prisma.memory.delete({
            where: {
                id: memoryId,
            },
        });
    }

    async search(projectId: string, query: string) {
        return prisma.memory.findMany({
            where: {
                projectId,
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        content: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    
}
