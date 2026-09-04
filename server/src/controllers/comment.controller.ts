import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { CommentService } from "../services/comment.service";

export class CommentController {
    private commentService = new CommentService();

    async createComment(req: AuthenticatedRequest, res: Response) {
        try {
          const comment = await this.commentService.createComment(
    req.user!.tenantId,
    {
        ...req.body,
        userId: req.user!.userId,
    }
);

            return res.status(201).json({
                success: true,
                message: "Comment created successfully",
                data: comment,
            });

        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getMemoryComments(req: AuthenticatedRequest, res: Response) {
        try {
            const comments = await this.commentService.getMemoryComments(
                req.params.memoryId as string
            );

            return res.status(200).json({
                success: true,
                data: comments,
            });

        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getFileComments(req: AuthenticatedRequest, res: Response) {
        try {
            const comments = await this.commentService.getFileComments(
                req.params.fileId as string
            );

            return res.status(200).json({
                success: true,
                data: comments,
            });

        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async updateComment(req: AuthenticatedRequest, res: Response) {
        try {
            const comment = await this.commentService.updateComment(
                req.params.commentId as string,
                req.body.content
            );

            return res.status(200).json({
                success: true,
                message: "Comment updated successfully",
                data: comment,
            });

        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async deleteComment(req: AuthenticatedRequest, res: Response) {
        try {
            await this.commentService.deleteComment(
                req.params.commentId as string
            );

            return res.status(200).json({
                success: true,
                message: "Comment deleted successfully",
            });

        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}