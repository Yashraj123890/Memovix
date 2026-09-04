"use client";

import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/api/team.service";
import { teamKeys } from "@/features/team/hooks/query-keys";

/**
 * Workspace members are tenant-wide and only needed to populate the Add
 * Member modal's candidate list — `enabled` keeps this from firing on
 * every Team page visit, only once the modal is actually opened.
 */
export function useWorkspaceMembersQuery(enabled: boolean) {
  return useQuery({
    queryKey: teamKeys.workspaceMembers(),
    queryFn: () => teamService.getWorkspaceMembers(),
    enabled,
  });
}
