"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { workspaceService } from "@/services/api/workspace.service";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/utils/error";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/constants/routes";

interface SwitchInput {
  tenantId: string;
  name: string;
}

/**
 * Switch the active workspace WITHOUT logging out (M11): the backend returns a
 * new access token scoped to the target workspace; we swap the session, drop
 * every workspace-scoped cache (all app data is scoped to the active tenant),
 * and land on the dashboard.
 */
export function useSwitchWorkspace() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setNeedsWorkspaceChoice = useAuthStore(
    (state) => state.setNeedsWorkspaceChoice,
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId }: SwitchInput) =>
      workspaceService.switch(tenantId),
    onSuccess: ({ accessToken, user }, variables) => {
      setSession({ token: accessToken, user });
      // A workspace has now been chosen — clear the pending-choice gate so the
      // dashboard is allowed to render (M11).
      setNeedsWorkspaceChoice(false);
      // All other queries hold data for the previous workspace — drop them.
      queryClient.removeQueries();
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
      toast.success(`Switched to ${variables.name}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
