import { randomUUID } from "node:crypto";
import { Prisma, DeliverableStatus, SearchableSourceType } from "@prisma/client";

import { DeliverableRepository } from "../repositories/deliverable.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectClientRepository } from "../repositories/projectClient.repository";
import { StorageProvider, UploadInput } from "../storage";

import { TimelineService } from "./timeline.service";
import searchableIndexService from "./searchableIndex.service";
import auditService from "./audit.service";
import notificationService from "./notification.service";
import { NotificationType } from "@prisma/client";
import { EmailService } from "./email/email.service";

/**
 * Deliverables + version history + approval workflow (blueprint §3.1.5–3.1.8).
 * Mirrors ProjectFileService: constructor-injected repositories +
 * StorageProvider, with Timeline + audit events on every state change.
 * Approve / Request-Revision are CLIENT-only actions that act on the current
 * (latest) version; re-submitting a REVISION_REQUESTED deliverable resolves
 * its still-open revision requests. The atomic Decision Log entry on approval
 * and notifications are added in the next phase.
 */
export class DeliverableService {
    private timelineService = new TimelineService();
    private emailService = new EmailService();
    private projectClientRepository = new ProjectClientRepository();

    /** Remove Markdown code ticks accidentally pasted around a title. */
    private cleanTitle(title: string): string {
        const cleaned = title.trim().replace(/^`+|`+$/g, "").trim();
        if (!cleaned) throw new Error("Title is required.");
        return cleaned;
    }

    constructor(
        private readonly deliverableRepository: DeliverableRepository,
        private readonly projectRepository: ProjectRepository,
        private readonly storageProvider: StorageProvider
    ) {}

    private async requireProject(projectId: string, tenantId: string) {
        const project = await this.projectRepository.findById(projectId, tenantId);
        if (!project) {
            throw new Error("Project not found");
        }
        return project;
    }

    private async requireDeliverable(deliverableId: string, tenantId: string) {
        const deliverable = await this.deliverableRepository.findById(deliverableId);
        if (!deliverable) {
            throw new Error("Deliverable not found");
        }
        // Tenant scoping: confirm the parent project belongs to this tenant.
        await this.requireProject(deliverable.projectId, tenantId);
        return deliverable;
    }

    async createDeliverable(input: {
        projectId: string;
        tenantId: string;
        createdById: string;
        title: string;
        description?: string | null;
        dueDate?: Date | null;
    }) {
        await this.requireProject(input.projectId, input.tenantId);

        const deliverable = await this.deliverableRepository.create({
            title: this.cleanTitle(input.title),
            description: input.description ?? null,
            dueDate: input.dueDate ?? null,
            project: { connect: { id: input.projectId } },
            createdBy: { connect: { id: input.createdById } },
        });

        await this.timelineService.createEvent({
            projectId: input.projectId,
            userId: input.createdById,
            action: "DELIVERABLE_CREATED",
            description: `Created deliverable: ${deliverable.title}`,
        });

        await auditService.createLog({
            tenantId: input.tenantId,
            userId: input.createdById,
            projectId: input.projectId,
            action: "DELIVERABLE_CREATED",
            entityType: "DELIVERABLE",
            entityId: deliverable.id,
            details: { title: deliverable.title },
        });

        // Unified retrieval index sync (best-effort — never fails the write).
        await searchableIndexService.syncSafe(SearchableSourceType.DELIVERABLE, deliverable.id);

        return deliverable;
    }

    async listDeliverables(projectId: string, tenantId: string) {
        await this.requireProject(projectId, tenantId);
        return this.deliverableRepository.findByProject(projectId);
    }

    async getDeliverable(deliverableId: string, tenantId: string) {
        return this.requireDeliverable(deliverableId, tenantId);
    }

    async updateDeliverable(
        deliverableId: string,
        tenantId: string,
        userId: string,
        input: {
            title?: string;
            description?: string | null;
            dueDate?: Date | null;
            status?: DeliverableStatus;
        }
    ) {
        const deliverable = await this.requireDeliverable(deliverableId, tenantId);

        const data: Prisma.DeliverableUpdateInput = {};

        if (input.title !== undefined) data.title = this.cleanTitle(input.title);
        if (input.description !== undefined) data.description = input.description;
        if (input.dueDate !== undefined) data.dueDate = input.dueDate;

        // This PATCH only handles DRAFT <-> SUBMITTED (the validator restricts
        // accepted values). APPROVED / REVISION_REQUESTED are produced only by
        // the client approve / request-revision endpoints.
        const targetStatus =
            input.status !== undefined && input.status !== deliverable.status ? input.status : null;

        let updated;
        // Whether THIS request performed the status transition — gates the
        // one-time side effects (timeline/audit/notifications) so repeated or
        // concurrent submits never duplicate them.
        let transitioned = true;

        if (targetStatus === DeliverableStatus.SUBMITTED) {
            if (deliverable.versions.length === 0) {
                throw new Error("Cannot submit a deliverable with no uploaded version.");
            }
            data.status = DeliverableStatus.SUBMITTED;
            data.submittedAt = new Date();

            const result = await this.deliverableRepository.submitDeliverable(
                deliverableId,
                data as Prisma.DeliverableUpdateManyMutationInput,
                deliverable.status === DeliverableStatus.REVISION_REQUESTED
            );
            updated = result.deliverable;
            transitioned = result.transitioned;
        } else {
            if (targetStatus === DeliverableStatus.DRAFT) {
                data.status = DeliverableStatus.DRAFT;
                data.submittedAt = null;
            }
            updated = await this.deliverableRepository.update(deliverableId, data);
        }

        if (targetStatus && transitioned) {
            await this.timelineService.createEvent({
                projectId: deliverable.projectId,
                userId,
                action: `DELIVERABLE_${targetStatus}`,
                description: `Deliverable "${updated.title}" marked ${targetStatus.toLowerCase()}`,
            });

            await auditService.createLog({
                tenantId,
                userId,
                projectId: deliverable.projectId,
                action: `DELIVERABLE_${targetStatus}`,
                entityType: "DELIVERABLE",
                entityId: updated.id,
                details: { status: targetStatus },
            });

            // Ready for review -> notify each assigned client (in-app + email),
            // exactly once per real submission transition.
            if (targetStatus === DeliverableStatus.SUBMITTED) {
                await this.notifyClientsOfSubmission(
                    deliverable.projectId,
                    updated.title,
                    tenantId
                );
            }
        }

        // Re-sync the unified retrieval index (title/description/status metadata).
        await searchableIndexService.syncSafe(SearchableSourceType.DELIVERABLE, updated.id);

        return updated;
    }

    private async notifyClientsOfSubmission(
        projectId: string,
        deliverableTitle: string,
        tenantId: string
    ) {
        const assignments = await this.projectClientRepository.findByProject(projectId);
        if (assignments.length === 0) return;

        const project = await this.projectRepository.findById(projectId, tenantId);
        const projectName = project?.name ?? "your project";

        for (const { client } of assignments) {
            await notificationService.createNotification({
                userId: client.id,
                projectId,
                type: NotificationType.DELIVERABLE_SUBMITTED,
                title: "Deliverable ready for review",
                message: `"${deliverableTitle}" is ready for your review.`,
            });

            try {
                await this.emailService.sendDeliverableUpdate({
                    to: client.email,
                    recipientName: client.name,
                    deliverableTitle,
                    projectName,
                    action: "submitted",
                });
            } catch {
                // Email is best-effort; never fail the submission on it.
            }
        }
    }

    async approveDeliverable(deliverableId: string, tenantId: string, userId: string) {
        const deliverable = await this.requireDeliverable(deliverableId, tenantId);

        // Only a SUBMITTED deliverable can be approved — this also prevents a
        // duplicate approval (an APPROVED deliverable is no longer SUBMITTED).
        if (deliverable.status !== DeliverableStatus.SUBMITTED) {
            throw new Error("Only a submitted deliverable can be approved.");
        }

        // Status change + Decision Log entry are written atomically.
        const updated = await this.deliverableRepository.approveWithDecision(
            deliverableId,
            deliverable.projectId,
            `Deliverable "${deliverable.title}" approved`
        );

        await this.timelineService.createEvent({
            projectId: deliverable.projectId,
            userId,
            action: "DELIVERABLE_APPROVED",
            description: `Deliverable "${updated.title}" approved`,
        });

        await auditService.createLog({
            tenantId,
            userId,
            projectId: deliverable.projectId,
            action: "DELIVERABLE_APPROVED",
            entityType: "DELIVERABLE",
            entityId: updated.id,
            details: { status: updated.status },
        });

        // Notify the deliverable owner (freelancer) in-app + by email.
        await notificationService.createNotification({
            userId: deliverable.createdById,
            projectId: deliverable.projectId,
            type: NotificationType.DELIVERABLE_APPROVED,
            title: "Deliverable approved",
            message: `Your deliverable "${deliverable.title}" was approved.`,
        });
        await this.sendDeliverableEmail(deliverableId, "approved");

        return updated;
    }

    /** Best-effort owner email on approval/revision — never fails the action. */
    private async sendDeliverableEmail(
        deliverableId: string,
        action: "approved" | "revision",
        comment?: string
    ) {
        try {
            const ctx = await this.deliverableRepository.getNotificationContext(deliverableId);
            if (!ctx?.createdBy?.email) return;

            await this.emailService.sendDeliverableUpdate({
                to: ctx.createdBy.email,
                recipientName: ctx.createdBy.name,
                deliverableTitle: ctx.title,
                projectName: ctx.project?.name ?? "your project",
                action,
                comment,
            });
        } catch {
            // Email delivery is best-effort; swallow errors.
        }
    }

    async requestRevision(deliverableId: string, tenantId: string, userId: string, comment: string) {
        const deliverable = await this.requireDeliverable(deliverableId, tenantId);

        // Only a SUBMITTED deliverable can be sent for revision.
        if (deliverable.status !== DeliverableStatus.SUBMITTED) {
            throw new Error("Only a submitted deliverable can be sent for revision.");
        }

        // Revision is raised against the current (latest) version.
        if (!deliverable.currentVersionId) {
            throw new Error("Deliverable has no current version to revise.");
        }

        // Prevent duplicate open revision requests (defensive — the SUBMITTED
        // guard above already implies none is open).
        const existingOpen = await this.deliverableRepository.findOpenRevisionRequest(deliverableId);
        if (existingOpen) {
            throw new Error("An open revision request already exists for this deliverable.");
        }

        const { deliverable: updated, revision } = await this.deliverableRepository.requestRevision(
            deliverableId,
            deliverable.currentVersionId,
            userId,
            comment
        );

        await this.timelineService.createEvent({
            projectId: deliverable.projectId,
            userId,
            action: "DELIVERABLE_REVISION_REQUESTED",
            description: `Revision requested on "${updated.title}"`,
        });

        await auditService.createLog({
            tenantId,
            userId,
            projectId: deliverable.projectId,
            action: "DELIVERABLE_REVISION_REQUESTED",
            entityType: "REVISION_REQUEST",
            entityId: revision.id,
            details: { comment },
        });

        await notificationService.createNotification({
            userId: deliverable.createdById,
            projectId: deliverable.projectId,
            type: NotificationType.DELIVERABLE_REVISION_REQUESTED,
            title: "Revision requested",
            message: `A revision was requested on "${deliverable.title}".`,
        });
        await this.sendDeliverableEmail(deliverableId, "revision", comment);

        return { deliverable: updated, revision };
    }

    async listRevisionRequests(deliverableId: string, tenantId: string) {
        await this.requireDeliverable(deliverableId, tenantId);
        return this.deliverableRepository.findRevisionRequestsByDeliverable(deliverableId);
    }

    async deleteDeliverable(deliverableId: string, tenantId: string, userId: string) {
        const deliverable = await this.requireDeliverable(deliverableId, tenantId);

        // Remove all version files from storage first, then the DB row
        // (cascade removes the version rows).
        for (const version of deliverable.versions) {
            await this.storageProvider.delete(version.storageKey);
        }

        await this.deliverableRepository.delete(deliverableId);

        await this.timelineService.createEvent({
            projectId: deliverable.projectId,
            userId,
            action: "DELIVERABLE_DELETED",
            description: `Deleted deliverable: ${deliverable.title}`,
        });

        await auditService.createLog({
            tenantId,
            userId,
            projectId: deliverable.projectId,
            action: "DELIVERABLE_DELETED",
            entityType: "DELIVERABLE",
            entityId: deliverable.id,
            details: { title: deliverable.title },
        });

        // Drop the deliverable from the unified retrieval index (best-effort).
        await searchableIndexService.removeSafe(SearchableSourceType.DELIVERABLE, deliverableId);

        return { message: "Deliverable deleted successfully" };
    }

    async addVersion(input: {
        deliverableId: string;
        tenantId: string;
        uploadedById: string;
        file: UploadInput;
        originalName: string;
        mimeType: string;
        size: number;
        changeSummary?: string | null;
    }) {
        const deliverable = await this.requireDeliverable(input.deliverableId, input.tenantId);

        const extension = input.originalName.split(".").pop();
        const storageKey = `${deliverable.projectId}/deliverables/${deliverable.id}/${randomUUID()}.${extension}`;

        await this.storageProvider.upload(input.file, storageKey);

        try {
            const nextNumber = (await this.deliverableRepository.countVersions(deliverable.id)) + 1;

            const version = await this.deliverableRepository.addVersion(deliverable.id, nextNumber, {
                storageKey,
                originalName: input.originalName,
                mimeType: input.mimeType,
                size: input.size,
                changeSummary: input.changeSummary ?? null,
                uploadedById: input.uploadedById,
            });

            await this.timelineService.createEvent({
                projectId: deliverable.projectId,
                userId: input.uploadedById,
                action: "DELIVERABLE_VERSION_UPLOADED",
                description: `Uploaded v${nextNumber} of "${deliverable.title}"`,
            });

            await auditService.createLog({
                tenantId: input.tenantId,
                userId: input.uploadedById,
                projectId: deliverable.projectId,
                action: "DELIVERABLE_VERSION_UPLOADED",
                entityType: "DELIVERABLE_VERSION",
                entityId: version.id,
                details: { versionNumber: nextNumber, originalName: input.originalName },
            });

            return version;
        } catch (error) {
            // Roll back the uploaded object if the DB write fails.
            await this.storageProvider.delete(storageKey);
            throw error;
        }
    }

    async getVersionDownloadUrl(
        deliverableId: string,
        versionId: string,
        tenantId: string,
        userId?: string,
        // When true, the signed URL forces a browser download (attachment) with
        // the original filename; when false it renders inline (Preview). Same
        // mechanism as ProjectFileService — see S3StorageProvider.getSignedUrl.
        forceDownload = false
    ) {
        const deliverable = await this.requireDeliverable(deliverableId, tenantId);

        const version = deliverable.versions.find((v) => v.id === versionId);
        if (!version) {
            throw new Error("Version not found");
        }

        const downloadUrl = await this.storageProvider.getSignedUrl(
            version.storageKey,
            forceDownload ? { downloadFileName: version.originalName } : undefined
        );

        // Blueprint §3.1.11 / §13.6 — record the download on the Activity Timeline.
        await this.timelineService.createEvent({
            projectId: deliverable.projectId,
            userId,
            action: "DELIVERABLE_VERSION_DOWNLOADED",
            description: `Downloaded v${version.versionNumber} of "${deliverable.title}"`,
        });

        return { fileName: version.originalName, downloadUrl };
    }
}
