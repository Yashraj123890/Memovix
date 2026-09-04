"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { scopeService } from "@/services/api/scope.service";
import { scopeFlagKeys } from "@/features/scope/hooks/query-keys";
import { requirementKeys } from "@/features/requirements/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";
import type { ScopeResolveAction } from "@/types/scope-flag";

/** Run the comparison pipeline over the project's non-baseline requirements. */
export function useCompareBaselineMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scopeService.compareBaseline(projectId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: scopeFlagKeys.projectAll(projectId),
      });
      toast.success(
        `Compared ${result.compared} requirement${result.compared === 1 ? "" : "s"}: ` +
          `${result.flagged} flagged, ${result.alreadyCovered} already covered`,
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Action a scope flag (accept into scope / decline / propose change order). */
export function useResolveScopeFlagMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      flagId,
      action,
    }: {
      flagId: string;
      action: ScopeResolveAction;
    }) => scopeService.resolve(projectId, flagId, action),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: scopeFlagKeys.projectAll(projectId),
      });
      // Accepting into scope promotes the requirement into the baseline.
      if (result.action === "accept_into_scope") {
        queryClient.invalidateQueries({
          queryKey: requirementKeys.projectAll(projectId),
        });
        toast.success("Accepted into baseline scope");
      } else if (result.action === "decline") {
        toast.success("Flag declined");
      } else {
        toast.success("Marked for a change order");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
