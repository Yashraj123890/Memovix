"use client";

import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/api/team.service";
import { teamKeys } from "@/features/team/hooks/query-keys";

/**
 * GET /api/members requires the OWNER role server-side (authorize("OWNER")
 * in member.routes.ts) — `enabled` keeps a non-owner viewer of this page
 * from firing a request that's guaranteed to 403.
 */
export function useInvitationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: teamKeys.invitations(),
    queryFn: () => teamService.getInvitations(),
    enabled,
  });
}
