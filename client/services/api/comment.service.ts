import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { Comment, CommentSubjectType } from "@/types/comment";

const COMMENT_ENDPOINTS = {
  create: "/comments",
  byMemory: (memoryId: string) => `/comments/memory/${memoryId}`,
  byFile: (fileId: string) => `/comments/file/${fileId}`,
  detail: (commentId: string) => `/comments/${commentId}`,
} as const;

export interface CreateCommentInput {
  subjectType: CommentSubjectType;
  subjectId: string;
  content: string;
}

/**
 * Comment API service (server/src/routes/comment.routes.ts). PUT
 * /comments/:id (update) exists on the backend but isn't used by F11 —
 * only Add/Delete were requested; add an updateComment method here if
 * editing is ever built.
 */
export const commentService = {
  async getComments(subjectType: CommentSubjectType, subjectId: string): Promise<Comment[]> {
    const endpoint =
      subjectType === "MEMORY"
        ? COMMENT_ENDPOINTS.byMemory(subjectId)
        : COMMENT_ENDPOINTS.byFile(subjectId);
    const response = await apiClient.get<ApiSuccessResponse<Comment[]>>(endpoint);
    return response.data.data;
  },

  async createComment({ subjectType, subjectId, content }: CreateCommentInput): Promise<Comment> {
    const payload =
      subjectType === "MEMORY" ? { memoryId: subjectId, content } : { fileId: subjectId, content };
    const response = await apiClient.post<ApiSuccessResponse<Comment>>(COMMENT_ENDPOINTS.create, payload);
    return response.data.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(COMMENT_ENDPOINTS.detail(commentId));
  },
};
