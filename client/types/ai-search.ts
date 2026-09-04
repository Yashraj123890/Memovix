/**
 * Mirrors the shape POST /api/ai/search is intended to return (see
 * server/src/repositories/semanticSearch.repository.ts) — a memory row
 * plus a pgvector cosine `distance` (lower = closer match), already
 * filtered server-side to distance <= 0.35. No `category`/`createdAt`/
 * author fields are selected by this endpoint, unlike the Memories list.
 */
export interface SemanticSearchResult {
  sourceType: import("@/utils/source-link").SourceType;
  sourceId: string;
  title: string;
  content: string;
  /** 0–1, higher = closer match (1 - cosine distance). */
  score: number;
}

/** Request body for POST /api/ai/search. */
export interface SemanticSearchRequest {
  projectId: string;
  query: string;
  limit?: number;
}
