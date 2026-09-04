"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { memoryService } from "@/services/api/memory.service";
import { memoryKeys } from "@/features/memories/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useDeleteMemoryMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memoryId: string) => memoryService.deleteMemory(memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoryKeys.project(projectId) });
      toast.success("Memory deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
