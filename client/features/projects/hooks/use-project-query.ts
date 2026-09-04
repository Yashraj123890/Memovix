"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/api/project.service";
import { projectKeys } from "@/features/projects/hooks/query-keys";
import type { Project } from "@/types/project";

/**
 * Fetches a single project by id.
 *
 * Cache reuse (F6 performance requirement): if the F5 Projects list
 * (projectKeys.lists()) is already cached — the normal case, since users
 * arrive here by clicking a ProjectCard — this seeds the query with that
 * row via `initialData`, so the workspace renders immediately instead of
 * waiting on a network round-trip. `initialDataUpdatedAt` is set to the
 * list query's own fetch time (not "now"), so this data is still subject
 * to the same staleTime rules as if it had been fetched directly — it
 * silently revalidates in the background rather than being treated as
 * artificially fresh forever.
 *
 * Called from both `[id]/layout.tsx` (header) and `[id]/page.tsx`
 * (Overview): both use the exact same `projectKeys.detail(id)` key, so
 * TanStack Query dedupes them into a single request/cache entry — no
 * React Context needed to "share" this data between the two, and no
 * duplicate network calls.
 */
export function useProjectQuery(projectId: string) {
  const queryClient = useQueryClient();

  return useQuery<Project>({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectService.getProjectById(projectId),
    initialData: () => {
      const cachedList = queryClient.getQueryData<Project[]>(projectKeys.lists());
      return cachedList?.find((project) => project.id === projectId);
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(projectKeys.lists())?.dataUpdatedAt,
  });
}
