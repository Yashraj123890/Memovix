"use client";

import { useQuery } from "@tanstack/react-query";
import { deliverableService } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";

export function useDeliverableQuery(deliverableId: string) {
  return useQuery({
    queryKey: deliverableKeys.detail(deliverableId),
    queryFn: () => deliverableService.get(deliverableId),
    enabled: Boolean(deliverableId),
    // Status is review-critical and can change in another session (a client
    // approves / requests changes while this tab is open). Override the global
    // refetchOnWindowFocus:false + staleTime so returning to this tab always
    // re-verifies the status — otherwise a stale SUBMITTED lingers and the
    // Approve action stays live against an already-decided deliverable.
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
