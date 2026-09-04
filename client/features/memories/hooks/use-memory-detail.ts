"use client";

import { useQuery } from "@tanstack/react-query";
import { memoryService } from "@/services/api/memory.service";
import { memoryKeys } from "@/features/memories/hooks/query-keys";

/**
 * Calls GET /memories/:memoryId directly. Previously this derived the
 * memory from the project-scoped list query to work around a backend bug
 * (getMemoryById delegated to updateMemory, writing a spurious
 * MEMORY_UPDATED timeline/audit entry on every view — see the resolved
 * memory-detail-endpoint-bug memory note). That bug has been fixed
 * server-side, so this now fetches the single memory the normal way.
 */
export function useMemoryDetail(memoryId: string) {
  const { data: memory, isLoading, isError, error, refetch } = useQuery({
    queryKey: memoryKeys.detail(memoryId),
    queryFn: () => memoryService.getMemoryById(memoryId),
  });

  const notFound = !isLoading && !isError && !memory;

  return { memory, isLoading, isError, error, refetch, notFound };
}
