"use client";

import { useQueries } from "@tanstack/react-query";
import { memoryService } from "@/services/api/memory.service";
import { memoryKeys } from "@/features/memories/hooks/query-keys";
import type { Project } from "@/types/project";
import type { DashboardMemory } from "@/types/dashboard";

/** How many of the tenant's most-recently-updated projects to pull memories from. Bounds the fan-out of per-project requests below (see the module comment). */
const MAX_PROJECTS_TO_SCAN = 6;
const MAX_MEMORIES = 4;

/**
 * There is no "recent memories across all my projects" endpoint on the
 * backend — only GET /memories/project/:projectId. So this fetches that
 * per-project endpoint for the tenant's most recently updated projects (via
 * the same memoryKeys.list cache key the Memories tab itself uses, so
 * visiting a project's Memories tab afterward is a cache hit, not a
 * duplicate request) and merges the results client-side, newest first.
 * Reuses real data only — no mock content.
 */
export function useRecentMemories(projects: Project[] | undefined) {
  const scannedProjects = [...(projects ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_PROJECTS_TO_SCAN);

  const results = useQueries({
    queries: scannedProjects.map((project) => ({
      queryKey: memoryKeys.list(project.id),
      queryFn: () => memoryService.getProjectMemories(project.id),
    })),
  });

  const isLoading = scannedProjects.length > 0 && results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  const memories: DashboardMemory[] = results
    .flatMap((result, index) => {
      const project = scannedProjects[index];
      return (result.data ?? []).map((memory) => ({ ...memory, projectName: project.name }));
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_MEMORIES);

  return { memories, isLoading, isError };
}
