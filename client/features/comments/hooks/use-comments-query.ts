"use client";

import { useQuery } from "@tanstack/react-query";
import { commentService } from "@/services/api/comment.service";
import { commentKeys } from "@/features/comments/hooks/query-keys";
import type { CommentSubjectType } from "@/types/comment";

export function useCommentsQuery(subjectType: CommentSubjectType, subjectId: string) {
  return useQuery({
    queryKey: commentKeys.forSubject(subjectType, subjectId),
    queryFn: () => commentService.getComments(subjectType, subjectId),
  });
}
