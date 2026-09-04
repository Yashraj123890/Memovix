"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamService } from "@/services/api/team.service";
import { teamKeys } from "@/features/team/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

export function useRemoveMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => teamService.removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.projectMembers(projectId) });
      toast.success("Member removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
