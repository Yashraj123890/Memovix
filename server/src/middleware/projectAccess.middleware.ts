import { Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

import { AuthenticatedRequest } from "./auth.middleware";
import { ProjectClientRepository } from "../repositories/projectClient.repository";
import { MemoryRepository } from "../repositories/memory.repository";
import { ProjectFileRepository } from "../repositories/project-file.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { DeliverableRepository } from "../repositories/deliverable.repository";

const projectClientRepository = new ProjectClientRepository();
const memoryRepository = new MemoryRepository();
const projectFileRepository = new ProjectFileRepository();
const commentRepository = new CommentRepository();
const deliverableRepository = new DeliverableRepository();

export async function checkProjectAccess(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    if (
        req.user.role === UserRole.OWNER ||
        req.user.role === UserRole.MEMBER
    ) {
        return next();
    }

 let projectId =
    (Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id) ??
    (Array.isArray(req.params.projectId)
        ? req.params.projectId[0]
        : req.params.projectId) ??
    req.body?.projectId;

if (!projectId && req.params.memoryId) {
 const memoryId = Array.isArray(req.params.memoryId)
    ? req.params.memoryId[0]
    : req.params.memoryId;

if (!memoryId) {
    return res.status(400).json({
        success: false,
        message: "Memory ID is required",
    });
}

const memory = await memoryRepository.findById(memoryId);
    if (!memory) {
        return res.status(404).json({
            success: false,
            message: "Memory not found",
        });
    }

    projectId = memory.projectId;
}

if (!projectId && req.params.fileId) {
  const fileId = Array.isArray(req.params.fileId)
    ? req.params.fileId[0]
    : req.params.fileId;
if (!fileId) {
    return res.status(400).json({
        success: false,
        message: "File ID is required",
    });
}

const file = await projectFileRepository.findById(fileId);
    if (!file) {
        return res.status(404).json({
            success: false,
            message: "File not found",
        });
    }

    projectId = file.projectId;
}

if (!projectId && req.params.deliverableId) {
  const deliverableId = Array.isArray(req.params.deliverableId)
    ? req.params.deliverableId[0]
    : req.params.deliverableId;

  if (!deliverableId) {
    return res.status(400).json({
        success: false,
        message: "Deliverable ID is required",
    });
  }

  const deliverable = await deliverableRepository.getProjectId(deliverableId);
  if (!deliverable) {
    return res.status(404).json({
        success: false,
        message: "Deliverable not found",
    });
  }

  projectId = deliverable.projectId;
}

if (!projectId && req.params.commentId) {
 const commentId = Array.isArray(req.params.commentId)
    ? req.params.commentId[0]
    : req.params.commentId;
if (!commentId) {
    return res.status(400).json({
        success: false,
        message: "Comment ID is required",
    });
}

const comment = await commentRepository.findById(commentId);
    if (!comment) {
        return res.status(404).json({
            success: false,
            message: "Comment not found",
        });
    }

  let projectId =
    (Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id) ??
    (Array.isArray(req.params.projectId)
        ? req.params.projectId[0]
        : req.params.projectId);
}
  if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project ID is required",
        });
    }

    const assignment =
await projectClientRepository.findClientProject(
    req.user.userId,
    projectId as string
);

    if (!assignment) {
        return res.status(403).json({
            success: false,
            message: "Access denied",
        });
    }

    next();
}