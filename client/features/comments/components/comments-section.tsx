"use client";

import { MessageSquareIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CommentComposer } from "@/features/comments/components/comment-composer";
import { CommentsList } from "@/features/comments/components/comments-list";
import { CommentsSkeleton } from "@/features/comments/components/comments-skeleton";
import { useCommentsQuery } from "@/features/comments/hooks/use-comments-query";
import { useAddCommentMutation } from "@/features/comments/hooks/use-add-comment-mutation";
import { useDeleteCommentMutation } from "@/features/comments/hooks/use-delete-comment-mutation";
import { getErrorMessage } from "@/utils/error";
import type { CommentSubjectType } from "@/types/comment";

export interface CommentsSectionProps {
  subjectType: CommentSubjectType;
  subjectId: string;
}

/**
 * Fully self-contained, reusable comment thread — not wired into any page
 * yet (there's no Memory/File detail view to host it in today). Drop this
 * into a future detail view with just
 * <CommentsSection subjectType="MEMORY" subjectId={memory.id} />;
 * nothing here needs to change when that page is built. Deliberately
 * unwrapped (no Card of its own) so the host page controls the container.
 */
export function CommentsSection({ subjectType, subjectId }: CommentsSectionProps) {
  const { data: comments, isLoading, isError, error, refetch } = useCommentsQuery(subjectType, subjectId);
  const addComment = useAddCommentMutation(subjectType, subjectId);
  const deleteComment = useDeleteCommentMutation(subjectType, subjectId);

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-foreground text-sm font-semibold">
        Comments{comments && comments.length > 0 ? ` (${comments.length})` : ""}
      </h3>

      {isLoading ? (
        <CommentsSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : comments && comments.length > 0 ? (
        <CommentsList
          comments={comments}
          onDelete={(commentId) => deleteComment.mutate(commentId)}
          deletingId={deleteComment.isPending ? (deleteComment.variables ?? null) : null}
        />
      ) : (
        <EmptyState
          icon={<MessageSquareIcon className="size-5" />}
          title="No comments yet"
          description="Be the first to leave a comment."
        />
      )}

      <CommentComposer
        onSubmit={(content) => addComment.mutate(content)}
        isSubmitting={addComment.isPending}
      />
    </div>
  );
}
