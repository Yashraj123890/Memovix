"use client";

import { Trash2Icon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/features/comments/utils/get-initials";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { Comment } from "@/types/comment";

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: string) => void;
  isDeleting: boolean;
}

/**
 * Delete button reveals on row hover via plain CSS opacity/transition
 * (not Motion) — subtle, and keeps a simple color/opacity change out of
 * the animation library.
 */
export function CommentItem({ comment, onDelete, isDeleting }: CommentItemProps) {
  return (
    <div className="group flex gap-3">
      <Avatar fallback={getInitials(comment.user.name)} alt={comment.user.name} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-medium">{comment.user.name}</span>
          <span className="text-muted-foreground text-xs">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-foreground mt-0.5 text-sm whitespace-pre-line">{comment.content}</p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onDelete(comment.id)}
        disabled={isDeleting}
        aria-label="Delete comment"
      >
        <Trash2Icon className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
