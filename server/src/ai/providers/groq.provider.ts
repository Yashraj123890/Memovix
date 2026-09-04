import { isAxiosError } from "axios";

import { AiUnavailableError, wrapAiError } from "../ai-error";
import { AIConfig } from "../config/ai.config";
import { AIHttpClient } from "../config/http-client";
import { ChatRequest, ChatResponse } from "../types/chat.types";
import { ChatProvider } from "./chat.provider";

const MAX_RATE_LIMIT_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 5000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(error: unknown, attempt: number): number {
  if (isAxiosError(error)) {
    const raw = error.response?.headers?.["retry-after"];
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS);
    }
  }
  return Math.min(500 * 2 ** attempt, MAX_RETRY_DELAY_MS);
}

function completionOptions(request: ChatRequest): Record<string, unknown> {
  const options = request.options ?? {};
  const numPredict = options.num_predict;
  const temperature = options.temperature;

  return {
    ...(typeof numPredict === "number"
      ? { max_completion_tokens: numPredict }
      : {}),
    ...(typeof temperature === "number"
      ? { temperature: Math.max(temperature, 1e-8) }
      : {}),
    ...(request.format !== undefined
      ? {
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "memovix_response",
              strict: true,
              schema: request.format,
            },
          },
        }
      : {}),
  };
}

export class GroqProvider implements ChatProvider {
  constructor() {
    if (!AIConfig.groq.apiKey) {
      throw new AiUnavailableError("Groq API key is not configured.");
    }
  }

  private get endpoint(): string {
    return `${AIConfig.groq.baseUrl.replace(/\/$/, "")}/chat/completions`;
  }

  private get headers() {
    return { Authorization: `Bearer ${AIConfig.groq.apiKey}` };
  }

  private async postWithRateLimitRetry(
    body: Record<string, unknown>,
    config: Record<string, unknown> = {},
  ) {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await AIHttpClient.post(this.endpoint, body, {
          ...config,
          headers: this.headers,
        });
      } catch (error) {
        const isRateLimited =
          isAxiosError(error) && error.response?.status === 429;
        if (!isRateLimited || attempt >= MAX_RATE_LIMIT_RETRIES) {
          if (isRateLimited) {
            throw new AiUnavailableError(
              "AI usage limit reached. Please try again shortly.",
            );
          }
          throw wrapAiError(error);
        }
        await delay(retryDelayMs(error, attempt));
      }
    }
  }

  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.postWithRateLimitRetry(
      {
        model: AIConfig.groq.chatModel,
        messages: request.messages,
        stream: false,
        reasoning_effort: AIConfig.groq.reasoningEffort,
        ...completionOptions(request),
      },
      request.timeoutMs !== undefined ? { timeout: request.timeoutMs } : {},
    );

    const message = response.data?.choices?.[0]?.message?.content;
    if (typeof message !== "string") {
      throw new AiUnavailableError("Groq returned an empty response.");
    }

    return { message, model: response.data?.model || AIConfig.groq.chatModel };
  }

  async *streamResponse(request: ChatRequest): AsyncIterable<string> {
    const response = await this.postWithRateLimitRetry(
      {
        model: AIConfig.groq.chatModel,
        messages: request.messages,
        stream: true,
        reasoning_effort: AIConfig.groq.reasoningEffort,
      },
      { responseType: "stream" },
    );

    const stream = response.data as NodeJS.ReadableStream;
    let buffer = "";

    for await (const chunk of stream) {
      buffer += chunk.toString();
      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (!line.startsWith("data:")) continue;

        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") {
          if (data === "[DONE]") return;
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) yield delta;
        } catch {
          // Ignore a malformed event; the next complete SSE event can continue.
        }
      }
    }
  }
}
