"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fileService } from "@/services/api/file.service";
import { fileKeys } from "@/features/files/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useDeleteFileMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list(projectId) });
      toast.success("File deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
