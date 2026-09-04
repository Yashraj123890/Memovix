"use client";

import { useState } from "react";
import { toast } from "sonner";
import { aiService } from "@/services/api/ai.service";
import { getErrorMessage } from "@/utils/error";
import type { ChatMessage, ChatSource } from "@/types/ai";

function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Per-project AI chat. Every turn is a stateless question grounded in a fresh
 * semantic search — there is no server-side history, so the running conversation
 * is client-side state here.
 *
 * The answer streams in over SSE (aiService.askStream): a placeholder assistant
 * message is appended immediately, then citations and token deltas fill it in.
 * If streaming fails for any reason (e.g. a 401 while the access token is being
 * refreshed, or a proxy that buffers SSE), it falls back to the one-shot
 * POST /ai/ask so the user still gets an answer — graceful degradation.
 */
export function useAiChat(projectId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  function patchMessage(id: string, patch: Partial<ChatMessage>) {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, ...patch } : message,
      ),
    );
  }

  function appendDelta(id: string, delta: string) {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id
          ? { ...message, content: message.content + delta }
          : message,
      ),
    );
  }

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isSending) return;

    const assistantId = createMessageId();
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        streaming: true,
      },
    ]);
    setIsSending(true);

    let sources: ChatSource[] | undefined;
    let confidence: number | undefined;

    try {
      await aiService.askStream(
        { projectId, question: trimmed },
        {
          onSources: (payload) => {
            sources = payload.sources;
            confidence = payload.confidence;
            patchMessage(assistantId, { sources, confidence });
          },
          onToken: (delta) => appendDelta(assistantId, delta),
          onMeta: (payload) => {
            patchMessage(assistantId, {
              uncited: payload.uncited,
              confidence: payload.confidence,
            });
          },
        },
      );
      patchMessage(assistantId, { streaming: false });
    } catch {
      // Graceful fallback: one-shot request through the refresh-aware client.
      try {
        const data = await aiService.ask({ projectId, question: trimmed });
        patchMessage(assistantId, {
          content: data.answer,
          sources: data.sources,
          confidence: data.confidence,
          uncited: data.uncited,
          streaming: false,
        });
      } catch (error) {
        // Both paths failed — drop the empty placeholder and surface the error.
        setMessages((prev) =>
          prev.filter((message) => message.id !== assistantId),
        );
        toast.error(getErrorMessage(error));
      }
    } finally {
      setIsSending(false);
    }
  }

  return {
    messages,
    sendQuestion,
    isSending,
  };
}
