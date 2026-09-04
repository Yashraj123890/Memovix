"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/api/auth.service";
import { getErrorMessage } from "@/utils/error";

/**
 * Change-password action for a signed-in user: reuses the existing secure
 * password-reset flow (POST /auth/forgot-password) with the account's own
 * email. The user completes the change from the emailed link — nothing is
 * faked client-side and no new backend is added.
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
    onSuccess: () => {
      toast.success("Password reset link sent — check your email.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
