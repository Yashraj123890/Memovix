"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/motion/fade-in";
import { getInitials } from "@/features/comments/utils/get-initials";
import { useAuthStore } from "@/stores/auth.store";
import { useProfile } from "@/features/settings/hooks/use-profile";

interface CommentComposerProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

/**
 * Multiline composer. The action row (Cancel/Comment) only appears once
 * the textarea has focus or content, and the textarea itself grows from
 * one row to three — the "composer expand" interaction, matching how
 * GitHub/Linear's comment box behaves. Collapses back on blur if left
 * empty.
 */
export function CommentComposer({ onSubmit, isSubmitting }: CommentComposerProps) {
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const { data: profile } = useProfile();

  const trimmed = content.trim();
  const showActions = isActive || trimmed.length > 0;

  function handleSubmit() {
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
    setContent("");
    setIsActive(false);
  }

  function handleCancel() {
    setContent("");
    setIsActive(false);
  }

  return (
    <div className="flex gap-3">
      <Avatar
        src={profile?.avatarUrl ?? undefined}
        fallback={currentUser ? getInitials(currentUser.name) : "?"}
        alt={currentUser?.name ?? ""}
      />

      <div className="flex flex-1 flex-col gap-2">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => {
            if (!content.trim()) {
              setIsActive(false);
            }
          }}
          placeholder="Add a comment..."
          rows={showActions ? 3 : 1}
          className="transition-[height] duration-150"
        />

        {showActions && (
          <FadeIn className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!trimmed}
              loading={isSubmitting}
              onClick={handleSubmit}
              className="gap-1.5"
            >
              <SendIcon className="size-3.5" aria-hidden="true" />
              Comment
            </Button>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
