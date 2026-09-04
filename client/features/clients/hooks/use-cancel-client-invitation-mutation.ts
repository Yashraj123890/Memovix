"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientService } from "@/services/api/client.service";
import { clientKeys } from "@/features/clients/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useCancelClientInvitationMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => clientService.cancelClientInvitation(projectId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.invitations(projectId) });
      toast.success("Invitation canceled");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
