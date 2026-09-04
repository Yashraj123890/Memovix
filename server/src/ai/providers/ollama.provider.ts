// import { AIConfig } from "../config/ai.config";
import { EmbeddingProvider } from "./embedding.provider";
import { EmbeddingRequest, EmbeddingResult } from "../types/embedding.types";
import { AIHttpClient } from "../config/http-client";
import { AIConfig } from "../config/ai.config";
import { ChatProvider } from "./chat.provider";
import { ChatRequest, ChatResponse } from "../types/chat.types";
import { wrapAiError } from "../ai-error";
export class OllamaProvider
  implements EmbeddingProvider, ChatProvider {
  async generateEmbedding(
  request: EmbeddingRequest
): Promise<EmbeddingResult> {

  try {

    const response = await AIHttpClient.post(
      `${AIConfig.ollama.url}/api/embeddings`,
      {
        model: AIConfig.ollama.embeddingModel,
        prompt: request.text,
      }
    );

    return {
      embedding: response.data.embedding,
      model: AIConfig.ollama.embeddingModel,
    };

  } catch (error) {
    // Preserve the underlying transport error's signal (via wrapAiError) instead
    // of flattening it to a generic string — otherwise a dead provider can't be
    // detected as "AI temporarily unavailable" by the AI controllers (§4.4).
    throw wrapAiError(error);
  }
}
async generateResponse(
  request: ChatRequest
): Promise<ChatResponse> {

  try {

    const response = await AIHttpClient.post(
      `${AIConfig.ollama.url}/api/chat`,
      {
        model: AIConfig.ollama.chatModel,
        messages: request.messages,
        stream: false,
        // Additive: only sent when a caller (e.g. the requirement extractor) asks
        // for structured output / bounded generation. Absent for chat/summary, so
        // their payload is byte-for-byte unchanged.
        ...(request.format !== undefined ? { format: request.format } : {}),
        ...(request.options !== undefined ? { options: request.options } : {}),
      },
      // Per-call timeout override for long background jobs; omitted → shared
      // 120s default. This is where a future GPU/hosted swap keeps working:
      // repoint OLLAMA_URL (GPU) or the provider, timeout stays configurable.
      request.timeoutMs !== undefined ? { timeout: request.timeoutMs } : undefined
    );

    return {
      message: response.data.message.content,
      model: AIConfig.ollama.chatModel,
    };

  } catch (error: any) {
  console.error("OLLAMA CHAT ERROR:");
  console.error(error.response?.data || error.message || error);

  throw error;
}
}

/**
 * Streaming chat (blueprint §8.8). Ollama's /api/chat with stream:true emits
 * newline-delimited JSON objects ({ message: { content }, done }); we read the
 * Node response stream, split on newlines, and yield each content delta until
 * `done`. Partial lines are buffered across chunks; malformed lines are skipped.
 */
async *streamResponse(
  request: ChatRequest,
): AsyncIterable<string> {
  const response = await AIHttpClient.post(
    `${AIConfig.ollama.url}/api/chat`,
    {
      model: AIConfig.ollama.chatModel,
      messages: request.messages,
      stream: true,
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
      if (!line) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(line);
      } catch {
        continue; // skip a malformed/partial line
      }

      const delta = parsed?.message?.content;
      if (delta) {
        yield delta as string;
      }
      if (parsed?.done) {
        return;
      }
    }
  }
}
}