"use client";

import { useQuery } from "@tanstack/react-query";
import { deliverableService } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";

export function useDeliverablesQuery(projectId: string) {
  return useQuery({
    queryKey: deliverableKeys.list(projectId),
    queryFn: () => deliverableService.list(projectId),
  });
}
