"use client";

import { useQuery } from "@tanstack/react-query";
import { timelineService } from "@/services/api/timeline.service";
import { timelineKeys } from "@/features/timeline/hooks/query-keys";

export function useTimelineQuery(projectId: string) {
  return useQuery({
    queryKey: timelineKeys.list(projectId),
    queryFn: () => timelineService.getProjectTimeline(projectId),
  });
}
