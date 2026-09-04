import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ProjectService } from "../services/project.service";

const projectService = new ProjectService();

export async function createProject(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const project = await projectService.createProject({
            tenantId: req.user!.tenantId,
            ownerId: req.user!.userId,
            name: req.body.name,
            description: req.body.description,
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function getProjects(
    req: AuthenticatedRequest,
    res: Response
) {
    const projects = await projectService.getProjects(
        req.user!.tenantId,
        req.user!.userId,
        req.user!.role
    );

    return res.json({
        success: true,
        data: projects,
    });
}

export async function getProjectById(
    req: AuthenticatedRequest,
    res: Response
) {
    const project = await projectService.getProjectById(
        req.params.id as string,
        req.user!.tenantId
    );

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    return res.json({
        success: true,
        data: project,
    });
}

export async function updateProject(
    req: AuthenticatedRequest,
    res: Response
) {
    await projectService.updateProject(
       req.params.id as string,
        req.user!.tenantId,
        req.body
    );

    return res.json({
        success: true,
        message: "Project updated successfully",
    });
}

export async function deleteProject(
    req: AuthenticatedRequest,
    res: Response
) {
    await projectService.deleteProject(
      req.params.id as string,
        req.user!.tenantId
    );

    return res.json({
        success: true,
        message: "Project deleted successfully",
    });
}