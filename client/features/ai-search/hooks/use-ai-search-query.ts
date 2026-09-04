"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { aiSearchService } from "@/services/api/ai-search.service";
import { aiSearchKeys } from "@/features/ai-search/hooks/query-keys";

/**
 * POST-as-query — TanStack Query doesn't care about HTTP verb, and this
 * is a read (semantic search), so it's modeled the same way
 * useMemoriesQuery models GET /memories/search/query: gated on a
 * non-empty (already-debounced) query string, with `keepPreviousData` so
 * results don't flash back to a loading state on every keystroke once
 * debounce settles.
 */
export function useAiSearchQuery(projectId: string, query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: aiSearchKeys.search(projectId, trimmed),
    queryFn: () => aiSearchService.search({ projectId, query: trimmed }),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
  });
}
