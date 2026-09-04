/**
 * Shared constants for the Axios API client (services/api/client.ts).
 * See docs/api-notes.md.
 */
export const API_TIMEOUT_MS = 15_000;

/**
 * Per-request timeout for the synchronous AI endpoints (meeting-notes
 * summarize, requirements extract). These run a full LLM generation inline, so
 * the default 15s cap aborts a request the backend is still legitimately
 * processing — the browser gives up (ECONNABORTED → "The request timed out")
 * while the server is mid-inference. This value matches the backend's own AI
 * HTTP ceiling (AIHttpClient.timeout = 120s) so the client waits exactly as
 * long as the server can, and no longer. It is applied per-call, NOT globally,
 * so ordinary endpoints keep the tight 15s timeout.
 */
export const AI_REQUEST_TIMEOUT_MS = 120_000;
