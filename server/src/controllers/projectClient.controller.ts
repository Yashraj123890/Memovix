import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ProjectClientService } from "../services/projectClient.service";

const projectClientService = new ProjectClientService();

export async function getClientProjects(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
       const clientId = req.user!.userId;
const tenantId = req.user!.tenantId;

const projects =
    await projectClientService.getClientProjects(
        clientId,
        tenantId
    );  

        return res.status(200).json({
            success: true,
            data: projects,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function getClientProject(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const clientId = req.user!.userId;
      const projectId = req.params.projectId as string;

const project =
    await projectClientService.getClientProject(
        clientId,
        projectId
    );

        return res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
    
}

export async function getProjectClients(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const projectId = req.params.projectId as string;

        const clients =
            await projectClientService.getProjectClients(
                projectId
            );

        return res.status(200).json({
            success: true,
            data: clients,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function removeProjectClient(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const projectId = req.params.projectId as string;
        const clientId = req.params.clientId as string;

        const result =
            await projectClientService.removeClient(
                projectId,
                clientId
            );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}