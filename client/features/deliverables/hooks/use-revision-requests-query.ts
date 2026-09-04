"use client";

import { useQuery } from "@tanstack/react-query";
import { deliverableService } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";

export function useRevisionRequestsQuery(deliverableId: string) {
  return useQuery({
    queryKey: deliverableKeys.revisions(deliverableId),
    queryFn: () => deliverableService.listRevisionRequests(deliverableId),
    enabled: Boolean(deliverableId),
  });
}
