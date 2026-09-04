"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { memoryService } from "@/services/api/memory.service";
import { memoryKeys } from "@/features/memories/hooks/query-keys";

/**
 * Backed by two backend endpoints depending on whether there's a search
 * term — mirrors the backend's own split between "list all" and
 * "search/query" (see services/api/memory.service.ts) rather than
 * fetching everything and filtering text client-side.
 *
 * `placeholderData: keepPreviousData` keeps the previous result set on
 * screen (with `isFetching` true) while a new search term resolves,
 * instead of flashing back to the loading skeleton on every keystroke —
 * each distinct search string is technically a new query key, so without
 * this the UI would otherwise look like it's reloading from scratch each
 * time the debounced value changes.
 */
export function useMemoriesQuery(projectId: string, search: string) {
  const trimmed = search.trim();

  return useQuery({
    queryKey: trimmed ? memoryKeys.search(projectId, trimmed) : memoryKeys.list(projectId),
    queryFn: () =>
      trimmed
        ? memoryService.searchMemories(projectId, trimmed)
        : memoryService.getProjectMemories(projectId),
    placeholderData: keepPreviousData,
  });
}
