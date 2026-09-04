"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { ChatMessageBubble } from "@/features/ai-workspace/components/chat/chat-message-bubble";
import { ChatTypingIndicator } from "@/features/ai-workspace/components/chat/chat-typing-indicator";
import type { ChatMessage } from "@/types/ai";

interface ChatMessageListProps {
  messages: ChatMessage[];
  projectId: string;
  currentUserName?: string;
  isSending: boolean;
}

/** Auto-scrolls to the newest turn whenever the conversation grows or a reply starts streaming in. */
export function ChatMessageList({ messages, projectId, currentUserName, isSending }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isSending]);

  return (
    <div className="flex-1 overflow-y-auto px-1">
      <ul className="flex flex-col gap-4 py-2" aria-live="polite" aria-relevant="additions">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              projectId={projectId}
              currentUserName={currentUserName}
              index={index}
            />
          ))}
        </AnimatePresence>
      </ul>
      {isSending && <ChatTypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}
