"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deliverableService } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

/** Client approves a submitted deliverable. */
export function useApproveDeliverableMutation(projectId: string, deliverableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deliverableService.approve(deliverableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.detail(deliverableId) });
      queryClient.invalidateQueries({ queryKey: deliverableKeys.list(projectId) });
      toast.success("Deliverable approved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      // Self-heal: the most common rejection is "no longer SUBMITTED" (another
      // session already approved / requested changes). Refetch so the badge and
      // the review panel immediately reflect the real status and the stale
      // Approve action disappears, instead of leaving the outdated SUBMITTED UI.
      queryClient.invalidateQueries({ queryKey: deliverableKeys.detail(deliverableId) });
      queryClient.invalidateQueries({ queryKey: deliverableKeys.list(projectId) });
    },
  });
}
