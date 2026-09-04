"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientService } from "@/services/api/client.service";
import { clientKeys } from "@/features/clients/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useInviteClientMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => clientService.inviteClient(projectId, email),
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.invitations(projectId) });
      toast.success(`Invitation sent to ${invitation.email}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
