"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deliverableService } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

/** Client requests changes (with a required comment) on a submitted deliverable. */
export function useRequestRevisionMutation(projectId: string, deliverableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: string) => deliverableService.requestRevision(deliverableId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.detail(deliverableId) });
      queryClient.invalidateQueries({ queryKey: deliverableKeys.revisions(deliverableId) });
      queryClient.invalidateQueries({ queryKey: deliverableKeys.list(projectId) });
      toast.success("Changes requested");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      // Self-heal: a "no longer SUBMITTED" rejection means another session
      // already decided this deliverable. Refetch so the UI reflects the real
      // status and the stale Request-Changes action disappears.
      queryClient.invalidateQueries({ queryKey: deliverableKeys.detail(deliverableId) });
      queryClient.invalidateQueries({ queryKey: deliverableKeys.list(projectId) });
    },
  });
}
