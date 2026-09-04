/**
 * Mirrors the Comment model in server/prisma/schema.prisma. A comment
 * attaches to either a Memory or a File, never both — see
 * server/src/services/comment.service.ts createComment.
 */
export type CommentSubjectType = "MEMORY" | "FILE";

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  memoryId: string | null;
  fileId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: CommentAuthor;
}
