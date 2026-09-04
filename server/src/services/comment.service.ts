import { CommentRepository } from "../repositories/comment.repository";
import { TimelineService } from "./timeline.service";
import notificationService from "./notification.service";
import searchableIndexService from "./searchableIndex.service";
import { NotificationType, SearchableSourceType } from "@prisma/client";
import auditService from "./audit.service";

import { ProjectClientRepository } from "../repositories/projectClient.repository";
import { MemoryRepository } from "../repositories/memory.repository";
import { ProjectFileRepository } from "../repositories/project-file.repository";
import { UserRole } from "@prisma/client";

export class CommentService {
    private commentRepository = new CommentRepository();
    private timelineService = new TimelineService();
    private projectClientRepository = new ProjectClientRepository();
private memoryRepository = new MemoryRepository();
private projectFileRepository = new ProjectFileRepository();

   async createComment(
    tenantId: string,
    data: {
        content: string;
        memoryId?: string;
        fileId?: string;
        userId: string;
    }
){
        if (!data.content.trim()) {
            throw new Error("Comment content is required");
        }

       const comment = await this.commentRepository.create(data);

let description = "Added a comment";

if (data.memoryId) {
    description = "Added a comment to a memory";
}

if (data.fileId) {
    description = "Added a comment to a file";
}

const createdComment = await this.commentRepository.findById(comment.id);

if (!createdComment) {
    throw new Error("Comment not found");
}
await notificationService.createNotification({
    userId: data.userId,
    projectId: createdComment.memory?.projectId ?? createdComment.file?.projectId,
    type: NotificationType.COMMENT_ADDED,
    title: "New Comment Added",
    message: "A new comment was added.",
});
await this.timelineService.createEvent({
    projectId: createdComment.memory?.projectId ?? createdComment.file?.projectId ?? "",
    userId: data.userId,
    action: "COMMENT_CREATED",
    description,
});
await auditService.createLog({
    tenantId,
    userId: data.userId,
    projectId:
        createdComment.memory?.projectId ??
        createdComment.file?.projectId,

    action: "COMMENT_CREATED",

    entityType: "COMMENT",
    entityId: comment.id,

    details: {
        content: comment.content,
        target: data.memoryId ? "MEMORY" : "FILE",
    },
});
// Unified retrieval index sync (best-effort — never fails the write).
await searchableIndexService.syncSafe(SearchableSourceType.COMMENT, comment.id);
return comment;
    }

    private async verifyProjectAccess(
    userId: string,
    role: UserRole,
    projectId: string
) {
    if (
        role === UserRole.OWNER ||
        role === UserRole.MEMBER
    ) {
        return;
    }

    const assignment =
        await this.projectClientRepository.findClientProject(
            userId,
            projectId
        );

    if (!assignment) {
        throw new Error("Access denied");
    }
}
    async getMemoryComments(memoryId: string) {
        return this.commentRepository.findByMemory(memoryId);
    }

    async getFileComments(fileId: string) {
        return this.commentRepository.findByFile(fileId);
    }

    async updateComment(commentId: string, content: string) {
        const updated = await this.commentRepository.update(commentId, content);
        // Re-sync the unified retrieval index after the edit (best-effort).
        await searchableIndexService.syncSafe(SearchableSourceType.COMMENT, commentId);
        return updated;
    }

    async deleteComment(commentId: string) {
        const result = await this.commentRepository.delete(commentId);
        // Drop the comment from the unified retrieval index (best-effort).
        await searchableIndexService.removeSafe(SearchableSourceType.COMMENT, commentId);
        return result;
    }
}