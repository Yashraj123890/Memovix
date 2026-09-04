import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

import { ProjectFileService } from "../services/project-file.service";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectFileRepository } from "../repositories/project-file.repository";
import { S3StorageProvider } from "../storage";

const projectFileService = new ProjectFileService(
    new ProjectRepository(),
    new ProjectFileRepository(),
    new S3StorageProvider()
);

export const uploadFile = async ( req: AuthenticatedRequest, res: Response, next: NextFunction ): Promise<void> => { try { if (!req.file) { res.status(400).json({ success: false, message: "No file uploaded", }); return; } if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized", }); return; } const projectId = req.body.projectId as string; const projectFile = await projectFileService.uploadFile( { data: req.file.buffer, contentType: req.file.mimetype, }, req.file.originalname, req.file.mimetype, req.file.size, projectId, req.user.userId, req.user.tenantId ); res.status(201).json({ success: true, message: "File uploaded successfully", data: projectFile, }); } catch (error) { next(error); } }; 

export const getProjectFiles = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;

        const files = await projectFileService.listProjectFiles(
            projectId,
            req.user!.tenantId
        );

        res.status(200).json({
            success: true,
            data: files,
        });
    } catch (error) {
        next(error);
    }
};

export const reindexFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const fileId = req.params.fileId as string;

        const result = await projectFileService.reindexFile(
            fileId,
            req.user!.tenantId
        );

        res.status(200).json({
            success: true,
            message: "File reindexed",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

    export const downloadFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const fileId = req.params.fileId as string;

        const result = await projectFileService.getDownloadUrl(
            fileId,
            req.user!.tenantId,
            req.user!.userId
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
    export const deleteFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const fileId = req.params.fileId as string;

        const result = await projectFileService.deleteFile(
            fileId,
            req.user!.tenantId
        );

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

