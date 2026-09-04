"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deliverableService, type CreateDeliverablePayload } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useCreateDeliverableMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDeliverablePayload) => deliverableService.create(projectId, payload),
    onSuccess: (deliverable) => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.list(projectId) });
      toast.success(`Deliverable "${deliverable.title}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
