import { AIConfig } from "../config/ai.config";
import { EmbeddingProvider } from "./embedding.provider";
import { EmbeddingRequest, EmbeddingResult } from "../types/embedding.types";
import { ChatProvider } from "./chat.provider";
import { ChatRequest, ChatResponse } from "../types/chat.types";

export class OpenAIProvider
  implements EmbeddingProvider, ChatProvider {
  async generateEmbedding(
    request: EmbeddingRequest
  ): Promise<EmbeddingResult> {

    // Implementation will be added later
    throw new Error("OpenAI embedding not implemented.");
  }
  async generateResponse(
  request: ChatRequest
): Promise<ChatResponse> {

  // We'll implement OpenAI later.
  throw new Error("OpenAI chat not implemented.");
}

  // eslint-disable-next-line require-yield
  async *streamResponse(
    request: ChatRequest
  ): AsyncIterable<string> {
    // We'll implement OpenAI later.
    throw new Error("OpenAI chat streaming not implemented.");
  }
}