import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/**
 * Extracts a safe, user-friendly message from an unknown error.
 *
 * Never surfaces raw stack traces or backend internals — see
 * docs/api-notes.md "Error Handling" and docs/design-system.md
 * "Error States" ("Never expose backend stack traces").
 *
 * This is transport-layer normalization shared by every feature; it does
 * not decide how an error is displayed (toast, inline text, etc.) — that
 * stays with feature/UI code.
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const backendMessage = error.response?.data?.message;
    if (backendMessage) {
      return backendMessage;
    }
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }
    if (!error.response) {
      return "Unable to reach the server. Check your connection.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return FALLBACK_MESSAGE;
}
