"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { LoadingState } from "@/components/shared/loading-state";
import { CHOOSE_WORKSPACE_ROUTE, LOGIN_ROUTE } from "@/constants/routes";

interface RequireAuthProps {
  children: ReactNode;
  /**
   * When true (default), a signed-in CLIENT with a still-pending workspace
   * choice (M11 `needsWorkspaceChoice`) is redirected to /choose-workspace and
   * this NEVER renders `children` — so an app route (e.g. the dashboard) can't
   * flash before the workspace-selection screen. The chooser's own layout
   * passes false so it can render itself.
   */
  requireWorkspaceChoice?: boolean;
}

/**
 * Protected-route guard. The session is restored on startup by AuthBootstrap
 * (silent /auth/refresh); until that resolves (`hasBootstrapped`) we show a
 * loader rather than flashing the login page. Once bootstrapped, no in-memory
 * access token means no session → redirect to /login. A later refresh failure
 * clears the token via the Axios interceptor, which re-triggers this redirect.
 */
export function RequireAuth({ children, requireWorkspaceChoice = true }: RequireAuthProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);
  const needsWorkspaceChoice = useAuthStore((state) => state.needsWorkspaceChoice);

  const isUnauthenticated = hasBootstrapped && !token;
  const mustChooseWorkspace =
    requireWorkspaceChoice && hasBootstrapped && Boolean(token) && needsWorkspaceChoice;

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace(LOGIN_ROUTE);
    } else if (mustChooseWorkspace) {
      router.replace(CHOOSE_WORKSPACE_ROUTE);
    }
  }, [isUnauthenticated, mustChooseWorkspace, router]);

  if (!hasBootstrapped) {
    return <LoadingState label="Loading your workspace..." />;
  }

  if (isUnauthenticated) {
    return null;
  }

  // Render a loader (never `children`) while redirecting to the chooser, so the
  // dashboard is never briefly shown before Choose Workspace.
  if (mustChooseWorkspace) {
    return <LoadingState label="Choosing your workspace..." />;
  }

  return <>{children}</>;
}
