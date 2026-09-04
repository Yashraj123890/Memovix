"use client";

import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/api/workspace.service";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLES } from "@/constants/roles";

export const WORKSPACES_QUERY_KEY = ["workspaces"] as const;

/**
 * The workspaces the signed-in CLIENT can access (M11). Disabled for
 * owners/members — they are single-workspace and must never fetch or see the
 * list — so this returns no data for them and the switcher renders nothing.
 */
export function useWorkspaces() {
  const user = useAuthStore((state) => state.user);
  const isClient = user?.role === USER_ROLES.CLIENT;

  return useQuery({
    queryKey: WORKSPACES_QUERY_KEY,
    queryFn: () => workspaceService.list(),
    enabled: isClient,
    staleTime: 60_000,
  });
}
