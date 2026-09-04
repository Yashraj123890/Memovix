"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { memoryService, type UpdateMemoryRequest } from "@/services/api/memory.service";
import { memoryKeys } from "@/features/memories/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useUpdateMemoryMutation(projectId: string, memoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMemoryRequest) => memoryService.updateMemory(memoryId, payload),
    onSuccess: (memory) => {
      queryClient.invalidateQueries({ queryKey: memoryKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: memoryKeys.detail(memoryId) });
      toast.success(`${memory.title} updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
