"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientService } from "@/services/api/client.service";
import { clientKeys } from "@/features/clients/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useRemoveClientMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => clientService.removeProjectClient(projectId, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.activeClients(projectId) });
      toast.success("Client removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
