"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentService } from "@/services/api/comment.service";
import { commentKeys } from "@/features/comments/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";
import type { CommentSubjectType } from "@/types/comment";

/**
 * DELETE /comments/:id only requires authentication, no author/role check
 * (server/src/routes/comment.routes.ts) — matching that, this mutation is
 * callable for any comment, not just ones the current user authored. See
 * the F10 correction: the frontend shouldn't invent restrictions the
 * backend doesn't enforce.
 */
export function useDeleteCommentMutation(subjectType: CommentSubjectType, subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.forSubject(subjectType, subjectId) });
      toast.success("Comment deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
