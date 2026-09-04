"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/api/auth.service";
import { workspaceService } from "@/services/api/workspace.service";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/utils/error";
import { USER_ROLES } from "@/constants/roles";
import {
  CHOOSE_WORKSPACE_ROUTE,
  DEFAULT_AUTHENTICATED_ROUTE,
} from "@/constants/routes";
import type { LoginRequest } from "@/types/auth";

/**
 * Login mutation. Persists the returned token + user into the auth store
 * (never into TanStack Query's cache — see docs/api-notes.md
 * "Authentication belongs in Zustand") and redirects on success.
 */
export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setNeedsWorkspaceChoice = useAuthStore(
    (state) => state.setNeedsWorkspaceChoice,
  );

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: async ({ accessToken, user }) => {
      // Resolve the destination BEFORE committing the session, using the token
      // explicitly (the store isn't set yet). Doing the async workspace lookup
      // while still unauthenticated means RequireGuest can't bounce the user to
      // the dashboard mid-await. `needsWorkspaceChoice` is then the single
      // synchronous flag both this flow and RequireGuest read, so they navigate
      // to the SAME place — the dashboard is never flashed before the chooser.
      let needsChoice = false;

      if (user.role === USER_ROLES.CLIENT) {
        try {
          const workspaces = await workspaceService.list(accessToken);
          needsChoice = workspaces.length > 1;
        } catch {
          // Non-fatal: fall through to the dashboard in the active workspace.
        }
      }

      setNeedsWorkspaceChoice(needsChoice);
      setSession({ token: accessToken, user });
      toast.success(`Welcome back, ${user.name}`);
      router.replace(
        needsChoice ? CHOOSE_WORKSPACE_ROUTE : DEFAULT_AUTHENTICATED_ROUTE,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
