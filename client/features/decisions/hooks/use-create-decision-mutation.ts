"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { decisionService, type CreateDecisionPayload } from "@/services/api/decision.service";
import { decisionKeys } from "@/features/decisions/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useCreateDecisionMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDecisionPayload) => decisionService.create(projectId, payload),
    onSuccess: () => {
      // Invalidate every category view for this project (list key is category-scoped).
      queryClient.invalidateQueries({ queryKey: decisionKeys.projectAll(projectId) });
      toast.success("Decision logged");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
