"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requirementService } from "@/services/api/requirement.service";
import { requirementKeys } from "@/features/requirements/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";
import type {
  ConfirmRequirementInput,
  UpdateRequirementInput,
} from "@/types/requirement";

/**
 * Requirement mutations, grouped in one file (they share the same invalidation
 * target — every persisted-list view for the project). Extraction is omitted
 * here: it proposes ephemeral candidates and persists nothing, so it uses a
 * plain useMutation at the call site with no cache invalidation.
 */

/** AI extraction — ephemeral proposals, no cache writes. */
export function useExtractRequirementsMutation(projectId: string) {
  return useMutation({
    mutationFn: (sourceFileId?: string) =>
      requirementService.extract(projectId, sourceFileId),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useConfirmRequirementsMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requirements: ConfirmRequirementInput[]) =>
      requirementService.confirm(projectId, requirements),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: requirementKeys.projectAll(projectId),
      });
      toast.success(
        `Accepted ${result.accepted} requirement${result.accepted === 1 ? "" : "s"}`,
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/**
 * Manually add a single New Request (a candidate requirement). Persists via the
 * same confirm endpoint as the review flow, so it is created with
 * isBaseline=false and lands in the New Requests lane, ready to be compared
 * against the Baseline Scope.
 */
export function useAddRequestMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requirement: ConfirmRequirementInput) =>
      requirementService.confirm(projectId, [requirement]),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: requirementKeys.projectAll(projectId),
      });
      toast.success("New request added");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectRequirementsMutation(projectId: string) {
  return useMutation({
    mutationFn: (titles: string[]) =>
      requirementService.reject(projectId, titles),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateRequirementMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requirementId,
      payload,
    }: {
      requirementId: string;
      payload: UpdateRequirementInput;
    }) => requirementService.update(projectId, requirementId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: requirementKeys.projectAll(projectId),
      });
      toast.success("Requirement updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/**
 * Move a single requirement between the Baseline Scope and the New Requests
 * (candidate) lane. Unlike `useSetBaselineMutation` (a full replace used for the
 * initial baseline), this touches one requirement, so adding a new request to
 * the baseline — or pulling one back out — never disturbs the rest of the set.
 */
export function useMoveRequirementLaneMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requirementId,
      isBaseline,
    }: {
      requirementId: string;
      isBaseline: boolean;
    }) => requirementService.update(projectId, requirementId, { isBaseline }),
    onSuccess: (requirement) => {
      queryClient.invalidateQueries({
        queryKey: requirementKeys.projectAll(projectId),
      });
      toast.success(
        requirement.isBaseline
          ? "Added to the Baseline Scope"
          : "Moved to New Requests",
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteRequirementMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requirementId: string) =>
      requirementService.remove(projectId, requirementId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: requirementKeys.projectAll(projectId),
      });
      toast.success("Requirement deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSetBaselineMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requirementIds: string[]) =>
      requirementService.setBaseline(projectId, requirementIds),
    onSuccess: (baseline) => {
      queryClient.invalidateQueries({
        queryKey: requirementKeys.projectAll(projectId),
      });
      toast.success(
        `Baseline scope set (${baseline.length} requirement${baseline.length === 1 ? "" : "s"})`,
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
