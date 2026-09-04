"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deliverableService } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useDeleteDeliverableMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliverableId: string) => deliverableService.remove(deliverableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.list(projectId) });
      toast.success("Deliverable deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
