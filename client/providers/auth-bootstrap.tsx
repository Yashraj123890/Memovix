"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { authService } from "@/services/api/auth.service";
import { useAuthStore } from "@/stores/auth.store";

/**
 * On app startup, silently exchange the HttpOnly refresh cookie for an access
 * token (M8, blueprint §13.1). Because the access token is memory-only, a hard
 * refresh always starts unauthenticated until this resolves — `markBootstrapped`
 * flips once done so the route guards can distinguish "still checking" from
 * "definitely logged out" and avoid flashing the login page.
 *
 * Runs exactly once per mount. A 401 (no/expired refresh cookie) is expected
 * when logged out and is swallowed — the interceptor exempts /auth/refresh, so
 * it never triggers a redirect on its own here.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const markBootstrapped = useAuthStore((state) => state.markBootstrapped);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    authService
      .refresh()
      .then(({ accessToken, user }) => setSession({ token: accessToken, user }))
      .catch(() => clearSession())
      .finally(() => markBootstrapped());
  }, [setSession, clearSession, markBootstrapped]);

  return <>{children}</>;
}
