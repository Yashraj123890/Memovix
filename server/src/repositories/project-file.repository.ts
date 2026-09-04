import prisma from "../lib/prisma";
import { Prisma, ProjectFile, FileIngestStatus } from "@prisma/client";

export class ProjectFileRepository {

    updateIngestStatus(
        id: string,
        ingestStatus: FileIngestStatus,
        ingestError: string | null
    ): Promise<ProjectFile> {
        return prisma.projectFile.update({
            where: { id },
            data: { ingestStatus, ingestError },
        });
    }

    async create(
        data: Prisma.ProjectFileCreateInput
    ): Promise<ProjectFile> {

        return prisma.projectFile.create({
            data,
        });

    }

    async findById(
        id: string
    ): Promise<ProjectFile | null> {

        return prisma.projectFile.findUnique({
            where: {
                id,
            },
        });

    }

    async findByProject(
        projectId: string
    ): Promise<ProjectFile[]> {

        return prisma.projectFile.findMany({
            where: {
                projectId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

    }

    async delete(
        id: string
    ): Promise<ProjectFile> {

        return prisma.projectFile.delete({
            where: {
                id,
            },
        });

    }
    async findByProjectId(projectId: string) {
    return prisma.projectFile.findMany({
        where: {
            projectId,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            originalName: true,
            mimeType: true,
            size: true,
            storageKey: true,
            createdAt: true,
            uploadedById: true,
            ingestStatus: true,
            ingestError: true,
        },
    });
}


}