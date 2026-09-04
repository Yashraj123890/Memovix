"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fileService } from "@/services/api/file.service";
import { fileKeys } from "@/features/files/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

/**
 * Re-runs document ingestion for a file (OWNER/MEMBER). Invalidates the file
 * list so the new ingestStatus badge appears once processing completes.
 */
export function useReindexFileMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileService.reindex(fileId),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list(projectId) });
      toast.success(`${file.originalName} queued for reindexing`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
