"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deliverableService } from "@/services/api/deliverable.service";
import { deliverableKeys } from "@/features/deliverables/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

interface UploadVersionVariables {
  file: File;
  changeSummary?: string;
}

/**
 * Uploads a new immutable version against a deliverable. Invalidates the
 * detail (version history) and the project list (version count / current
 * version metadata).
 */
export function useUploadVersionMutation(projectId: string, deliverableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, changeSummary }: UploadVersionVariables) =>
      deliverableService.uploadVersion(deliverableId, file, changeSummary),
    onSuccess: (version) => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.detail(deliverableId) });
      queryClient.invalidateQueries({ queryKey: deliverableKeys.list(projectId) });
      toast.success(`Version ${version.versionNumber} uploaded`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
