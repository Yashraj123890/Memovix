import { Request, Response } from "express";
import { MemoryService } from "../services/memory.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class MemoryController {
    private memoryService = new MemoryService();

    async createMemory(req: AuthenticatedRequest, res: Response) {
        try {
            const memory = await this.memoryService.createMemory({
                ...req.body,
                createdById: req.user!.userId,
                tenantId: req.user!.tenantId,
            });

            return res.status(201).json({
                success: true,
                message: "Memory created successfully",
                data: memory,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getProjectMemories(req: Request, res: Response) {
        try {
           const memories = await this.memoryService.getProjectMemories(
    req.params.projectId as string
);

            return res.status(200).json({
                success: true,
                data: memories,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

   async getMemoryById(req: Request, res: Response) {
    try {
        const memory = await this.memoryService.getMemoryById(
            req.params.memoryId as string
        );

        return res.status(200).json({
            success: true,
            data: memory,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}
async updateMemory(req: Request, res: Response) {
    try {
        const memory = await this.memoryService.updateMemory(
            req.params.memoryId as string,
            (req as any).user.tenantId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Memory updated successfully",
            data: memory,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

    async deleteMemory(req: Request, res: Response) {
        try {
      await this.memoryService.deleteMemory(
    req.params.memoryId as string,
    (req as any).user.tenantId
);
            return res.status(200).json({
                success: true,
                message: "Memory deleted successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async searchMemories(req: Request, res: Response) {
        try {
            const { projectId, query } = req.query;

            const memories = await this.memoryService.searchMemories(
                projectId as string,
                query as string
            );

            return res.status(200).json({
                success: true,
                data: memories,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}