"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/api/auth.service";

/**
 * Completes a password reset. Success/error UI is driven off the returned
 * mutation state (isSuccess shows the "signed-in ready" panel; error surfaces
 * the backend message for invalid/expired/used tokens) — see
 * reset-password-form.tsx.
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  });
}
