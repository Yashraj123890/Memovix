"use client";

import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/api/workspace.service";
import { useAuthStore } from "@/stores/auth.store";
import { WORKSPACES_QUERY_KEY } from "@/features/workspace/hooks/use-workspaces";
import type { Workspace } from "@/types/workspace";

/**
 * The signed-in user's active workspace, for the Settings > Workspace section.
 * GET /auth/workspaces returns every accessible workspace ({ tenantId, name,
 * role }) — for owners/members that's their single workspace (see the backend
 * getWorkspaces contract). Shares the query key with useWorkspaces so the
 * client switcher and this reuse one cache entry. Unlike useWorkspaces (gated
 * to the client switcher), this runs for any authenticated user because the
 * Settings page needs the workspace name for every role.
 */
export function useCurrentWorkspace() {
  const user = useAuthStore((state) => state.user);

  const query = useQuery({
    queryKey: WORKSPACES_QUERY_KEY,
    queryFn: () => workspaceService.list(),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const active: Workspace | undefined = query.data?.find(
    (workspace) => workspace.tenantId === user?.tenantId,
  );

  return { ...query, workspace: active };
}
