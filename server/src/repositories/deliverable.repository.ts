import prisma, { withTenantTx } from "../lib/prisma";
import {
    Prisma,
    DeliverableStatus,
    RevisionStatus,
    DecisionCategory,
    DecisionSourceType,
} from "@prisma/client";

/**
 * Thin Prisma wrapper for Deliverables and their immutable versions, following
 * the same repository pattern as ProjectFileRepository. Version creation is
 * transactional so the deliverable's denormalized `currentVersionId` can never
 * point at a half-written version row.
 */
export class DeliverableRepository {
    create(data: Prisma.DeliverableCreateInput) {
        return prisma.deliverable.create({ data });
    }

    findByProject(projectId: string) {
        return prisma.deliverable.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" },
            include: {
                currentVersion: true,
                _count: { select: { versions: true } },
            },
        });
    }

    findById(id: string) {
        return prisma.deliverable.findUnique({
            where: { id },
            include: {
                // createdBy / uploadedBy are additive reads for the detail view's
                // "Created by" and "Uploaded by" labels — no logic depends on them.
                createdBy: { select: { id: true, name: true, email: true } },
                versions: {
                    orderBy: { versionNumber: "desc" },
                    include: { uploadedBy: { select: { id: true, name: true } } },
                },
                currentVersion: {
                    include: { uploadedBy: { select: { id: true, name: true } } },
                },
            },
        });
    }

    /** Lightweight lookup used by projectAccess.middleware for tenant/project scoping. */
    getProjectId(id: string) {
        return prisma.deliverable.findUnique({
            where: { id },
            select: { projectId: true },
        });
    }

    update(id: string, data: Prisma.DeliverableUpdateInput) {
        return prisma.deliverable.update({ where: { id }, data });
    }

    delete(id: string) {
        return prisma.deliverable.delete({ where: { id } });
    }

    countVersions(deliverableId: string) {
        return prisma.deliverableVersion.count({ where: { deliverableId } });
    }

    /**
     * Create a new immutable version and repoint the deliverable's
     * currentVersionId at it, atomically.
     */
    addVersion(
        deliverableId: string,
        versionNumber: number,
        data: {
            storageKey: string;
            originalName: string;
            mimeType: string;
            size: number;
            changeSummary: string | null;
            uploadedById: string;
        }
    ) {
        return withTenantTx(async (tx) => {
            const version = await tx.deliverableVersion.create({
                data: {
                    deliverableId,
                    versionNumber,
                    storageKey: data.storageKey,
                    originalName: data.originalName,
                    mimeType: data.mimeType,
                    size: data.size,
                    changeSummary: data.changeSummary,
                    uploadedById: data.uploadedById,
                },
            });

            await tx.deliverable.update({
                where: { id: deliverableId },
                data: { currentVersionId: version.id },
            });

            return version;
        });
    }

    /**
     * Approve a deliverable AND append the auto-generated Decision Log entry
     * in the SAME transaction (blueprint §3.1.7 — status change and decision
     * record created atomically). The decision is system-sourced
     * (sourceType APPROVAL, loggedById null).
     */
    approveWithDecision(deliverableId: string, projectId: string, description: string) {
        return withTenantTx(async (tx) => {
            const deliverable = await tx.deliverable.update({
                where: { id: deliverableId },
                data: { status: DeliverableStatus.APPROVED, approvedAt: new Date() },
            });

            await tx.decisionLog.create({
                data: {
                    projectId,
                    category: DecisionCategory.OTHER,
                    description,
                    sourceType: DecisionSourceType.APPROVAL,
                    sourceId: deliverableId,
                },
            });

            return deliverable;
        });
    }

    /** Creator contact + project name for post-transition notifications/email. */
    getNotificationContext(deliverableId: string) {
        return prisma.deliverable.findUnique({
            where: { id: deliverableId },
            select: {
                title: true,
                createdBy: { select: { id: true, name: true, email: true } },
                project: { select: { name: true } },
            },
        });
    }

    findOpenRevisionRequest(deliverableId: string) {
        return prisma.revisionRequest.findFirst({
            where: { deliverableId, status: RevisionStatus.OPEN },
        });
    }

    findRevisionRequestsByDeliverable(deliverableId: string) {
        return prisma.revisionRequest.findMany({
            where: { deliverableId },
            orderBy: { createdAt: "desc" },
            include: { requestedBy: { select: { id: true, name: true } } },
        });
    }

    /**
     * Move a deliverable to REVISION_REQUESTED and record the revision request
     * against the given (latest) version — atomically.
     */
    requestRevision(
        deliverableId: string,
        deliverableVersionId: string,
        requestedById: string,
        comment: string
    ) {
        return withTenantTx(async (tx) => {
            const deliverable = await tx.deliverable.update({
                where: { id: deliverableId },
                data: { status: DeliverableStatus.REVISION_REQUESTED },
            });

            const revision = await tx.revisionRequest.create({
                data: { deliverableId, deliverableVersionId, requestedById, comment },
            });

            return { deliverable, revision };
        });
    }

    /**
     * Compare-and-set transition to SUBMITTED: only updates when the deliverable
     * is NOT already SUBMITTED, so exactly one caller performs the transition
     * (repeated PATCH / concurrent double-clicks don't re-submit or re-notify).
     * When re-submitting after a revision cycle, still-open revision requests are
     * resolved in the same transaction. Returns whether THIS call transitioned.
     */
    submitDeliverable(
        deliverableId: string,
        data: Prisma.DeliverableUpdateManyMutationInput,
        resolveRevisions: boolean
    ) {
        return withTenantTx(async (tx) => {
            const result = await tx.deliverable.updateMany({
                where: { id: deliverableId, status: { not: DeliverableStatus.SUBMITTED } },
                data,
            });

            if (result.count === 0) {
                const current = await tx.deliverable.findUniqueOrThrow({ where: { id: deliverableId } });
                return { transitioned: false, deliverable: current };
            }

            if (resolveRevisions) {
                await tx.revisionRequest.updateMany({
                    where: { deliverableId, status: RevisionStatus.OPEN },
                    data: { status: RevisionStatus.RESOLVED, resolvedAt: new Date() },
                });
            }

            const deliverable = await tx.deliverable.findUniqueOrThrow({ where: { id: deliverableId } });
            return { transitioned: true, deliverable };
        });
    }
}
