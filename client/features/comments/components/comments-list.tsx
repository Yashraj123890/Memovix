"use client";

import { AnimatePresence } from "motion/react";
import { StaggerItem } from "@/components/motion/stagger-item";
import { CommentItem } from "@/features/comments/components/comment-item";
import type { Comment } from "@/types/comment";

interface CommentsListProps {
  comments: Comment[];
  onDelete: (commentId: string) => void;
  deletingId: string | null;
}

/** Stagger-in on load, collapse-out on delete — see components/motion/stagger-item.tsx. */
export function CommentsList({ comments, onDelete, deletingId }: CommentsListProps) {
  return (
    <ul className="flex flex-col gap-4">
      <AnimatePresence>
        {comments.map((comment, index) => (
          <StaggerItem key={comment.id} index={index}>
            <CommentItem comment={comment} onDelete={onDelete} isDeleting={deletingId === comment.id} />
          </StaggerItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
