"use client";

import * as React from "react";
import { useState } from "react";
import { SendIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatComposerProps {
  onSend: (question: string) => void;
  isSending: boolean;
}

/** Enter sends, Shift+Enter inserts a newline — standard chat-input keyboard behavior. */
export function ChatComposer({ onSend, isSending }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();

  function handleSend() {
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border/60 pt-3">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about this project..."
        aria-label="Ask AI a question about this project"
        rows={1}
        disabled={isSending}
        className="max-h-32 min-h-9 flex-1"
      />
      <Button
        type="button"
        size="icon"
        disabled={!trimmed}
        loading={isSending}
        onClick={handleSend}
        aria-label="Send message"
      >
        <SendIcon className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
