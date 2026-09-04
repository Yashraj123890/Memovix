"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { memoryService, type CreateMemoryRequest } from "@/services/api/memory.service";
import { memoryKeys } from "@/features/memories/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useCreateMemoryMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateMemoryRequest, "projectId">) =>
      memoryService.createMemory({ ...payload, projectId }),
    onSuccess: (memory) => {
      queryClient.invalidateQueries({ queryKey: memoryKeys.project(projectId) });
      toast.success(`${memory.title} added`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
