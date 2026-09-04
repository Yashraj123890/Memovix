"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientRegistrationService } from "@/services/api/client-registration.service";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/utils/error";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/constants/routes";
import type { ClientRegisterRequest } from "@/types/auth";

/**
 * Mirrors useLogin/useRegister exactly: persist { token, user } into the
 * auth store, toast, redirect to DEFAULT_AUTHENTICATED_ROUTE. There is no
 * separate client-specific dashboard route in this app today — Dashboard
 * ("/") is the same destination login/register already use, so a new
 * client lands there too rather than somewhere invented for this flow.
 *
 * queryClient.clear() (same as useLogout) is essential here, not optional:
 * /client/register/:token deliberately renders even when another user (the
 * owner) is still signed in, so this mutation can replace a live session.
 * Without clearing, the previous user's cached queries (projects,
 * notifications, /auth/me) would bleed into the brand-new client session
 * until they went stale. Clearing forces every query to refetch under the
 * new token.
 */
export function useClientRegisterMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: ClientRegisterRequest) =>
      clientRegistrationService.register(payload),
    onSuccess: ({ accessToken, user }) => {
      setSession({ token: accessToken, user });
      queryClient.clear();
      toast.success(`Welcome to Memovix, ${user.name}`);
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
