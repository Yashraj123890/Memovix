"use client";

import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/api/project.service";
import { projectKeys } from "@/features/projects/hooks/query-keys";

/**
 * Fetches the tenant's full project list. Search/status filtering is
 * applied client-side on top of this (see utils/filter-projects.ts) since
 * the backend doesn't support server-side filtering yet — see the F5
 * architecture note in query-keys.ts.
 */
export function useProjectsQuery() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectService.getProjects(),
  });
}
