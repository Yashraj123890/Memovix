import { isAxiosError } from "axios";

/**
 * Raised (or mapped-to) when the AI provider is unreachable / errored, so every
 * AI endpoint degrades gracefully with one consistent, user-facing message
 * instead of leaking a raw driver error (blueprint §4.4 "AI features fail
 * visibly with a clear 'AI temporarily unavailable' message"). Core CRUD is
 * unaffected because the AI layer is isolated.
 */
export class AiUnavailableError extends Error {
  readonly statusCode = 503;

  constructor(
    message = "AI is temporarily unavailable. Please try again shortly.",
  ) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

const CONNECTIVITY_CODES = [
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNABORTED",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
];

/**
 * Map a provider/transport failure to AiUnavailableError, leaving every other
 * error untouched. Any Axios error inside an AI request comes from the AI HTTP
 * client (the LLM/embedding provider), so it is treated as "AI unavailable";
 * connectivity error codes are caught too. Application errors (e.g. "Project
 * not found", or a Zod "unexpected format" for malformed LLM JSON) pass through
 * unchanged so they keep their own specific handling.
 */
export function wrapAiError(error: unknown): Error {
  if (error instanceof AiUnavailableError) {
    return error;
  }

  if (isAxiosError(error)) {
    return new AiUnavailableError();
  }

  const code = (error as { code?: unknown } | null | undefined)?.code;
  if (typeof code === "string" && CONNECTIVITY_CODES.includes(code)) {
    return new AiUnavailableError();
  }

  return error instanceof Error
    ? error
    : new Error(String((error as { message?: unknown })?.message ?? "AI request failed"));
}
