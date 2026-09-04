"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fileService } from "@/services/api/file.service";
import { fileKeys } from "@/features/files/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

/**
 * Invalidates the project's file list on success so the newly uploaded
 * file appears immediately — no optimistic insert, since the server
 * response is the source of truth for id/storageKey/createdAt.
 */
export function useUploadFileMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => fileService.uploadFile(projectId, file),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list(projectId) });
      toast.success(`${file.originalName} uploaded`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
