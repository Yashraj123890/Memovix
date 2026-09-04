"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deliverableService, type UpdateDeliverablePayload } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

/**
 * Handles both edits (title/description/dueDate) and status transitions
 * (DRAFT <-> SUBMITTED). Invalidates the detail and the project list so the
 * status badge / version metadata stay in sync in both views.
 */
export function useUpdateDeliverableMutation(projectId: string, deliverableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDeliverablePayload) =>
      deliverableService.update(deliverableId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.detail(deliverableId) });
      queryClient.invalidateQueries({ queryKey: deliverableKeys.list(projectId) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
