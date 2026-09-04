import { Response } from "express";
import { DeliverableStatus } from "@prisma/client";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { DeliverableService } from "../services/deliverable.service";
import { DeliverableRepository } from "../repositories/deliverable.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { S3StorageProvider } from "../storage";

const deliverableService = new DeliverableService(
    new DeliverableRepository(),
    new ProjectRepository(),
    new S3StorageProvider()
);

function handleError(res: Response, error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    const status = /not found/i.test(message) ? 404 : 400;
    return res.status(status).json({ success: false, message });
}

export async function createDeliverable(req: AuthenticatedRequest, res: Response) {
    try {
        const projectId = String(req.params.projectId);
        const { title, description, dueDate } = req.body;

        const deliverable = await deliverableService.createDeliverable({
            projectId,
            tenantId: req.user!.tenantId,
            createdById: req.user!.userId,
            title,
            description,
            dueDate,
        });

        return res.status(201).json({ success: true, data: deliverable });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function listDeliverables(req: AuthenticatedRequest, res: Response) {
    try {
        const projectId = String(req.params.projectId);
        const deliverables = await deliverableService.listDeliverables(
            projectId,
            req.user!.tenantId
        );
        return res.status(200).json({ success: true, data: deliverables });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getDeliverable(req: AuthenticatedRequest, res: Response) {
    try {
        const deliverableId = String(req.params.deliverableId);
        const deliverable = await deliverableService.getDeliverable(
            deliverableId,
            req.user!.tenantId
        );
        return res.status(200).json({ success: true, data: deliverable });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function updateDeliverable(req: AuthenticatedRequest, res: Response) {
    try {
        const deliverableId = String(req.params.deliverableId);
        const { title, description, dueDate, status } = req.body;

        const deliverable = await deliverableService.updateDeliverable(
            deliverableId,
            req.user!.tenantId,
            req.user!.userId,
            {
                title,
                description,
                dueDate,
                status: status as DeliverableStatus | undefined,
            }
        );

        return res.status(200).json({ success: true, data: deliverable });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function approveDeliverable(req: AuthenticatedRequest, res: Response) {
    try {
        const deliverableId = String(req.params.deliverableId);
        const deliverable = await deliverableService.approveDeliverable(
            deliverableId,
            req.user!.tenantId,
            req.user!.userId
        );
        return res.status(200).json({ success: true, data: deliverable });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function requestRevision(req: AuthenticatedRequest, res: Response) {
    try {
        const deliverableId = String(req.params.deliverableId);
        const { comment } = req.body;

        const result = await deliverableService.requestRevision(
            deliverableId,
            req.user!.tenantId,
            req.user!.userId,
            comment
        );
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function listRevisionRequests(req: AuthenticatedRequest, res: Response) {
    try {
        const deliverableId = String(req.params.deliverableId);
        const revisions = await deliverableService.listRevisionRequests(
            deliverableId,
            req.user!.tenantId
        );
        return res.status(200).json({ success: true, data: revisions });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function deleteDeliverable(req: AuthenticatedRequest, res: Response) {
    try {
        const deliverableId = String(req.params.deliverableId);
        const result = await deliverableService.deleteDeliverable(
            deliverableId,
            req.user!.tenantId,
            req.user!.userId
        );
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function uploadDeliverableVersion(req: AuthenticatedRequest, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const deliverableId = String(req.params.deliverableId);
        const changeSummaryRaw = req.body?.changeSummary;
        const changeSummary =
            typeof changeSummaryRaw === "string" && changeSummaryRaw.trim().length > 0
                ? changeSummaryRaw.trim().slice(0, 5000)
                : null;

        const version = await deliverableService.addVersion({
            deliverableId,
            tenantId: req.user!.tenantId,
            uploadedById: req.user!.userId,
            file: { data: req.file.buffer, contentType: req.file.mimetype },
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            changeSummary,
        });

        return res.status(201).json({ success: true, data: version });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function downloadDeliverableVersion(req: AuthenticatedRequest, res: Response) {
    try {
        const deliverableId = String(req.params.deliverableId);
        const versionId = String(req.params.versionId);
        // ?disposition=attachment -> force a real download; otherwise inline (Preview).
        const forceDownload = req.query.disposition === "attachment";

        const result = await deliverableService.getVersionDownloadUrl(
            deliverableId,
            versionId,
            req.user!.tenantId,
            req.user!.userId,
            forceDownload
        );

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return handleError(res, error);
    }
}
