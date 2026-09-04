import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { ClientRegisterRequest, ClientRegisterResponseData } from "@/types/auth";

const CLIENT_REGISTRATION_ENDPOINTS = {
  register: "/client/register",
} as const;

/**
 * Separate from services/api/client.service.ts on purpose: that service is
 * project-scoped client *management* (invite/list/remove, all
 * authenticated, all requiring a projectId). This one is the public,
 * unauthenticated, token-based self-registration call a brand-new client
 * makes from the /client/register/:token link in their invitation email —
 * same relationship as authService.register vs the owner-only
 * services/api/client.service.ts inviteClient.
 */
export const clientRegistrationService = {
  async register(payload: ClientRegisterRequest): Promise<ClientRegisterResponseData> {
    const response = await apiClient.post<ApiSuccessResponse<ClientRegisterResponseData>>(
      CLIENT_REGISTRATION_ENDPOINTS.register,
      payload,
    );
    return response.data.data;
  },
};
