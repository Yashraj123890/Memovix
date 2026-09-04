import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { SemanticSearchRequest, SemanticSearchResult } from "@/types/ai-search";

const AI_SEARCH_ENDPOINTS = {
  search: "/ai/search",
} as const;

/**
 * POST /api/ai/search (server/src/routes/semanticSearch.routes.ts), a
 * real pgvector embedding search — not the title/content LIKE search
 * behind GET /memories/search/query (that's memoryService.searchMemories).
 */
export const aiSearchService = {
  async search(request: SemanticSearchRequest): Promise<SemanticSearchResult[]> {
    const response = await apiClient.post<ApiSuccessResponse<SemanticSearchResult[]>>(
      AI_SEARCH_ENDPOINTS.search,
      request,
    );
    return response.data.data;
  },
};
