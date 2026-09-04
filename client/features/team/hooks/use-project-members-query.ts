"use client";

import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/api/team.service";
import { teamKeys } from "@/features/team/hooks/query-keys";

export function useProjectMembersQuery(projectId: string) {
  return useQuery({
    queryKey: teamKeys.projectMembers(projectId),
    queryFn: () => teamService.getProjectMembers(projectId),
  });
}
