"use client";

import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/api/client.service";
import { clientKeys } from "@/features/clients/hooks/query-keys";

/**
 * GET /api/projects/:projectId/client-invitations allows OWNER or MEMBER
 * server-side (authorize(UserRole.OWNER, UserRole.MEMBER)) — unlike the
 * workspace member invitations list (OWNER-only), so this has no `enabled`
 * gate tied to role; any authenticated project participant can see it.
 */
export function useClientInvitationsQuery(projectId: string) {
  return useQuery({
    queryKey: clientKeys.invitations(projectId),
    queryFn: () => clientService.getClientInvitations(projectId),
  });
}
