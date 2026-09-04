"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/api/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/utils/error";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/constants/routes";
import type { RegisterRequest } from "@/types/auth";

/**
 * Registration mutation. Mirrors useLogin exactly, with one difference: the
 * backend's register response key is `owner` (not `user` — see
 * RegisterResponseData), because registering also creates the tenant. That
 * `owner` is stored into the auth store's `user` field so the rest of the
 * app never has to know registration and login return differently-shaped
 * payloads.
 */
export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    onSuccess: ({ accessToken, owner }) => {
      setSession({ token: accessToken, user: owner });
      toast.success(`Welcome to Memovix, ${owner.name}`);
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
