"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamService } from "@/services/api/team.service";
import { teamKeys } from "@/features/team/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useCancelInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations() });
      toast.success("Invitation canceled");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
