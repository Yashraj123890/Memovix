"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamService } from "@/services/api/team.service";
import { teamKeys } from "@/features/team/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useInviteMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => teamService.inviteMember(email),
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations() });
      toast.success(`Invitation sent to ${invitation.email}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
