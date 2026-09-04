import { randomUUID } from "node:crypto";

import { ProjectFile } from "@prisma/client";

import { ProjectRepository } from "../repositories/project.repository";
import { ProjectFileRepository } from "../repositories/project-file.repository";

import {
    StorageProvider,
    UploadInput,
} from "../storage";

import { TimelineService } from "./timeline.service";
import notificationService from "./notification.service";
import { NotificationType } from "@prisma/client";
import auditService from "./audit.service";
import { ingestionWorkflow } from "../ai/ingestion/ingestion.workflow";
import { runWithTenantContext } from "../lib/tenant-context";

export class ProjectFileService {
private timelineService = new TimelineService();
    constructor(
        private readonly projectRepository: ProjectRepository,
        private readonly projectFileRepository: ProjectFileRepository,
        private readonly storageProvider: StorageProvider
    ) {}

    async uploadFile(
    input: UploadInput,
    originalName: string,
    mimeType: string,
    size: number,
    projectId: string,
    uploadedById: string,
    tenantId: string
): Promise<ProjectFile> {

    // Check project exists
    const project = await this.projectRepository.findById(
        projectId,
        tenantId
    );

    if (!project) {
        throw new Error("Project not found");
    }

    // Generate unique storage key
    const extension = originalName.split(".").pop();

    const storageKey =
        `${tenantId}/${projectId}/${randomUUID()}.${extension}`;

    // Upload file to S3
    await this.storageProvider.upload(
        input,
        storageKey
    );

    let file: ProjectFile;

    try {

        // Save file metadata in database
        file = await this.projectFileRepository.create({

            originalName,

            storageKey,

            mimeType,

            size,

            project: {
                connect: {
                    id: projectId,
                },
            },

            uploadedBy: {
                connect: {
                    id: uploadedById,
                },
            },

        });
        await notificationService.createNotification({
    userId: uploadedById,
    projectId,
    type: NotificationType.FILE_UPLOADED,
    title: "New File Uploaded",
    message: `A new file "${originalName}" was uploaded.`,
});

        // Create timeline event
        await this.timelineService.createEvent({
            projectId,
            userId: uploadedById,
            action: "FILE_UPLOADED",
            description: `Uploaded file: ${originalName}`,
        });
        await auditService.createLog({
    tenantId,
    userId: uploadedById,
    projectId,

    action: "FILE_UPLOADED",

    entityType: "FILE",
    entityId: file.id,

    details: {
        fileName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
    },
});

    } catch (error) {

        // Rollback uploaded file from S3
        await this.storageProvider.delete(storageKey);

        throw error;

    }

    // Return the stored file immediately. Extraction and Ollama embeddings can
    // take much longer than an HTTP upload timeout, so ingestion runs detached
    // and reports progress through the existing ingestStatus field.
    this.startIngestion(file.id, tenantId);

    return file;

}

async reindexFile(fileId: string, tenantId: string) {
    const file = await this.projectFileRepository.findById(fileId);
    if (!file) {
        throw new Error("File not found");
    }

    // Tenant scoping: confirm the file's project belongs to this tenant.
    const project = await this.projectRepository.findById(file.projectId, tenantId);
    if (!project) {
        throw new Error("File not found");
    }

    await this.projectFileRepository.updateIngestStatus(
        fileId,
        "PENDING",
        null,
    );
    this.startIngestion(fileId, tenantId);
    const updated = await this.projectFileRepository.findById(fileId);

    return { file: updated ?? file, ingest: { status: "PENDING", chunkCount: 0 } };
}

private startIngestion(fileId: string, tenantId: string): void {
    void runWithTenantContext({ tenantId }, async () => {
        try {
            await ingestionWorkflow.processFile(fileId);
        } catch (error) {
            // processFile records ordinary extraction/embedding failures itself;
            // this protects the detached task from becoming an unhandled rejection.
            console.error(
                `[ProjectFileService] Background ingestion failed for ${fileId}:`,
                error instanceof Error ? error.message : error,
            );
        }
    });
}
    
async listProjectFiles(projectId: string, tenantId: string) {
    const project = await this.projectRepository.findById(projectId, tenantId);

    if (!project) {
        throw new Error("Project not found");
    }

    return await this.projectFileRepository.findByProjectId(projectId);
}
async getDownloadUrl(
    fileId: string,
    tenantId: string,
    userId?: string
) {
    const file = await this.projectFileRepository.findById(fileId);

    if (!file) {
        throw new Error("File not found");
    }

    const project = await this.projectRepository.findById(
        file.projectId,
        tenantId
    );

    if (!project) {
        throw new Error("Project not found");
    }

    const downloadUrl = await this.storageProvider.getSignedUrl(
        file.storageKey,
        { downloadFileName: file.originalName }
    );

    // Blueprint §3.1.11 / §13.6 — every download is recorded on the Activity
    // Timeline (audit trail for sensitive-document access).
    await this.timelineService.createEvent({
        projectId: file.projectId,
        userId,
        action: "FILE_DOWNLOADED",
        description: `Downloaded file: ${file.originalName}`,
    });

    return {
        fileName: file.originalName,
        downloadUrl,
    };
}
async deleteFile(
    fileId: string,
    tenantId: string
) {
    const file = await this.projectFileRepository.findById(fileId);

    if (!file) {
        throw new Error("File not found");
    }

    const project = await this.projectRepository.findById(
        file.projectId,
        tenantId
    );

    if (!project) {
        throw new Error("Project not found");
    }

    // Delete from S3
await this.storageProvider.delete(file.storageKey);

// Delete metadata
await this.projectFileRepository.delete(fileId);

// Timeline
await this.timelineService.createEvent({
    projectId: file.projectId,
    userId: file.uploadedById,
    action: "FILE_DELETED",
    description: `Deleted file: ${file.originalName}`,
});
await auditService.createLog({
    tenantId,
    userId: file.uploadedById,
    projectId: file.projectId,

    action: "FILE_DELETED",

    entityType: "FILE",
    entityId: file.id,

    details: {
        fileName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
    },
});
return {
    message: "File deleted successfully",
};
}
}
