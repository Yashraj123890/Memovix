import { apiClient } from "./client";
import { AI_REQUEST_TIMEOUT_MS } from "@/constants/api";
import { env } from "@/config/env";
import { getAuthToken } from "@/stores/auth.store";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AskQuestionRequest,
  ChatAnswer,
  ChatSource,
  GenerateSummaryRequest,
  ProjectSummary,
} from "@/types/ai";

const AI_ENDPOINTS = {
  ask: "/ai/ask",
  askStream: "/ai/ask/stream",
  summary: "/ai/summary",
} as const;

export interface ChatStreamHandlers {
  /** Fired once, up front, with the citations + confidence for this answer. */
  onSources?: (payload: { sources: ChatSource[]; confidence: number }) => void;
  /** Fired for every answer token delta as it streams in. */
  onToken: (delta: string) => void;
  /**
   * Fired once at the end with the citation-compliance result: `uncited` true
   * when the model skipped its [Source: N] citation, plus the (de-rated)
   * confidence. Arrives after the tokens, before the stream closes.
   */
  onMeta?: (payload: { uncited: boolean; confidence: number }) => void;
}

/**
 * AI Workspace API calls — Chat (POST /api/ai/ask + /ai/ask/stream) and Summary
 * (POST /api/ai/summary). The prototype's requirements/comparison/scope calls
 * were removed with the M6/M7 cleanup; that functionality now lives in the
 * dedicated Requirements tab (requirement.service.ts / scope.service.ts).
 */
export const aiService = {
  async ask(request: AskQuestionRequest): Promise<ChatAnswer> {
    const response = await apiClient.post<ApiSuccessResponse<ChatAnswer>>(
      AI_ENDPOINTS.ask,
      request,
    );
    return response.data.data;
  },

  /**
   * Streaming chat over SSE (blueprint §8.8). Uses `fetch` (not the axios
   * instance) because streaming the response body requires a ReadableStream.
   * Attaches the in-memory access token; the caller falls back to `ask` on any
   * failure (e.g. 401 mid-refresh), so this never has to handle refresh itself.
   */
  async askStream(
    request: AskQuestionRequest,
    handlers: ChatStreamHandlers,
    signal?: AbortSignal,
  ): Promise<void> {
    const token = getAuthToken();

    const response = await fetch(`${env.apiUrl}${AI_ENDPOINTS.askStream}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Streaming request failed (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let separatorIndex: number;
      while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);

        let eventName = "message";
        let data = "";
        for (const line of rawEvent.split("\n")) {
          if (line.startsWith("event:")) eventName = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (!data) continue;

        if (eventName === "sources") {
          handlers.onSources?.(JSON.parse(data));
        } else if (eventName === "token") {
          handlers.onToken(JSON.parse(data).delta ?? "");
        } else if (eventName === "meta") {
          handlers.onMeta?.(JSON.parse(data));
        } else if (eventName === "error") {
          throw new Error(
            JSON.parse(data).message ?? "AI response was interrupted.",
          );
        }
        // "done" ends the stream; the reader loop finishes naturally.
      }
    }
  },

  async generateSummary(
    request: GenerateSummaryRequest,
  ): Promise<ProjectSummary> {
    const response = await apiClient.post<ApiSuccessResponse<ProjectSummary>>(
      AI_ENDPOINTS.summary,
      request,
      // Summary runs a full LLM generation server-side and far exceeds the
      // default 15s cap; wait up to the backend's AI ceiling instead of aborting.
      { timeout: AI_REQUEST_TIMEOUT_MS },
    );
    return response.data.data;
  },
};
