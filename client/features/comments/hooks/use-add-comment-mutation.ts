"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentService } from "@/services/api/comment.service";
import { commentKeys } from "@/features/comments/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";
import type { CommentSubjectType } from "@/types/comment";

/**
 * POST /comments returns the raw created row without the joined `user`
 * (server/src/repositories/comment.repository.ts create has no include)
 * — invalidating and refetching, rather than appending the mutation
 * response directly to the list, is what gets the author name/email onto
 * screen without extra handling for the incomplete response shape.
 */
export function useAddCommentMutation(subjectType: CommentSubjectType, subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => commentService.createComment({ subjectType, subjectId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.forSubject(subjectType, subjectId) });
      toast.success("Comment added");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
