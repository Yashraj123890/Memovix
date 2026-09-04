"use client";

import { useQueries } from "@tanstack/react-query";
import { timelineService } from "@/services/api/timeline.service";
import { timelineKeys } from "@/features/timeline/hooks/query-keys";
import type { Project } from "@/types/project";
import type { DashboardActivityItem } from "@/types/dashboard";

/** Mirrors use-recent-memories.ts's cap — see that file's comment. */
const MAX_PROJECTS_TO_SCAN = 6;
const MAX_ACTIVITY_ITEMS = 5;

/**
 * Same shape of problem as useRecentMemories: no cross-project activity
 * feed exists on the backend, only GET /projects/:projectId/timeline. This
 * fans that out across the most recently updated projects (via
 * timelineKeys.list, the same cache key the Timeline tab uses) and merges
 * client-side, newest first.
 */
export function useRecentActivity(projects: Project[] | undefined) {
  const scannedProjects = [...(projects ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_PROJECTS_TO_SCAN);

  const results = useQueries({
    queries: scannedProjects.map((project) => ({
      queryKey: timelineKeys.list(project.id),
      queryFn: () => timelineService.getProjectTimeline(project.id),
    })),
  });

  const isLoading = scannedProjects.length > 0 && results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  const activity: DashboardActivityItem[] = results
    .flatMap((result, index) => {
      const project = scannedProjects[index];
      return (result.data ?? []).map((event) => ({ ...event, projectName: project.name }));
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_ACTIVITY_ITEMS);

  return { activity, isLoading, isError };
}
