import { ChatRequest, ChatResponse } from "../types/chat.types";

export interface ChatProvider {
  /** One-shot generation — returns the full answer (used by /ai/ask). */
  generateResponse(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Streaming generation — yields answer token deltas as they are produced
   * (used by the SSE endpoint /ai/ask/stream, blueprint §8.8). Consumers
   * concatenate the deltas to form the full answer.
   */
  streamResponse(request: ChatRequest): AsyncIterable<string>;
}
