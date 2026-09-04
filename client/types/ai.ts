/**
 * Types for the AI Workspace — now Chat + Summary only. Requirement
 * extraction, comparison and scope analysis were removed with the prototype
 * (that territory moved to the dedicated Requirements tab). Mirrors the
 * response shapes in server/src/ai/workflows/* consumed by ai.service.ts.
 */

// ---------------------------------------------------------------------------
// Chat — POST /api/ai/ask
// ---------------------------------------------------------------------------

/**
 * Mirrors ChatWorkflowResponse (server/src/ai/workflows/chat.workflow.ts).
 * There is no chat-history endpoint — every call is a single stateless
 * question/answer pair grounded in the project's memories via semantic
 * search — so conversation state is kept client-side only (see
 * features/ai-workspace/hooks/use-ai-chat.ts).
 */
/**
 * Discriminated by `source`: memory citations link to the memory detail page,
 * document citations to the file detail page (M5 union retrieval).
 * `score` is 0–1, higher = closer semantic match (1 - pgvector distance).
 */
/**
 * Chat citation (P2, unified retrieval). `sourceType` + `sourceId` let the UI
 * deep-link to the origin; `label` is the display name; `score` is 0–1
 * (1 - cosine distance).
 */
export interface ChatSource {
  sourceType: import("@/utils/source-link").SourceType;
  sourceId: string;
  label: string;
  score: number;
}

export interface ChatAnswer {
  answer: string;
  sources: ChatSource[];
  /** 0–1 confidence derived from the top source's match score. */
  confidence: number;
  /**
   * Model-compliance flag: true when the answer is a real (non-fallback) reply
   * that omitted the required [Source: N] citation. Confidence is de-rated when
   * set. The answer text itself is never modified (blueprint §8.8/§11).
   */
  uncited?: boolean;
}

export interface AskQuestionRequest {
  projectId: string;
  question: string;
}

/** One turn in the client-side conversation log. */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** ISO timestamp set client-side at creation — there's no server-side message history to source this from. */
  createdAt: string;
  sources?: ChatSource[];
  confidence?: number;
  /** True while an assistant reply is still streaming in token-by-token. */
  streaming?: boolean;
  /** Model-compliance flag: a non-fallback answer that omitted its [Source: N] citation. */
  uncited?: boolean;
}

// ---------------------------------------------------------------------------
// Reports — Summary
// ---------------------------------------------------------------------------

/** The "generate a markdown report on demand" feature(s), driven by useAiReports. */
export type AiReportKind = "summary";

/** Mirrors SummaryWorkflowResponse — POST /api/ai/summary. */
export interface ProjectSummary {
  summary: string;
}

export interface GenerateSummaryRequest {
  projectId: string;
  projectName: string;
}
