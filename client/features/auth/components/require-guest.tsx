"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { LoadingState } from "@/components/shared/loading-state";
import {
  CHOOSE_WORKSPACE_ROUTE,
  DEFAULT_AUTHENTICATED_ROUTE,
} from "@/constants/routes";

interface RequireGuestProps {
  children: ReactNode;
}

/**
 * Public-only guard (/login, /register). Waits for the startup refresh
 * (AuthBootstrap) so an already-signed-in user landing here is redirected to
 * the app instead of seeing the login form again.
 */
export function RequireGuest({ children }: RequireGuestProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);
  const needsWorkspaceChoice = useAuthStore(
    (state) => state.needsWorkspaceChoice,
  );

  const isAuthenticated = hasBootstrapped && Boolean(token);

  useEffect(() => {
    if (isAuthenticated) {
      // Same workspace-aware destination as useLogin (shared flag), so an
      // authenticated user leaving /login never lands on the dashboard when a
      // workspace choice is still pending (M11).
      router.replace(
        needsWorkspaceChoice
          ? CHOOSE_WORKSPACE_ROUTE
          : DEFAULT_AUTHENTICATED_ROUTE,
      );
    }
  }, [isAuthenticated, needsWorkspaceChoice, router]);

  if (!hasBootstrapped) {
    return <LoadingState label="Checking your session..." />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
