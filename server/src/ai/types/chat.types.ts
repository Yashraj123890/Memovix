export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  /**
   * Optional provider-native structured-output spec (Ollama `format`: "json" or
   * a JSON Schema object). When set, the provider constrains generation to that
   * shape. Omitted by the chat/summary paths, so their requests are unchanged.
   */
  format?: unknown;
  /**
   * Optional provider-native generation options (e.g. Ollama `options`:
   * { num_predict }). Additive — undefined leaves the request payload identical
   * to before.
   */
  options?: Record<string, unknown>;
  /**
   * Optional per-call HTTP timeout (ms) that overrides the shared AIHttpClient
   * default (120s). Used by long BACKGROUND jobs — e.g. the meeting extraction
   * job, whose single combined generation can run ~140s on the local CPU model
   * (measured in Phase 0) and would otherwise trip the 120s inline default.
   * Undefined leaves the shared-client timeout in force.
   */
  timeoutMs?: number;
}

export interface ChatResponse {
  message: string;
  model: string;
}