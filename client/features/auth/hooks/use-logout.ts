"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/api/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { LOGIN_ROUTE } from "@/constants/routes";

/**
 * Logout: revoke the refresh session server-side (POST /auth/logout clears the
 * HttpOnly cookie and invalidates the token in the DB), then drop the in-memory
 * access token, clear cached queries, and redirect to /login. The server call
 * is best-effort — even if it fails, the local session is always cleared.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return async function logout() {
    try {
      await authService.logout();
    } catch {
      // Best-effort — clear locally regardless of the server response.
    } finally {
      clearSession();
      queryClient.clear();
      router.replace(LOGIN_ROUTE);
    }
  };
}
