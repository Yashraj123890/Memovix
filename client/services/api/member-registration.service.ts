import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { MemberRegisterRequest, MemberRegisterResponseData } from "@/types/auth";

const MEMBER_REGISTRATION_ENDPOINTS = {
  register: "/members/register",
} as const;

/**
 * Separate from services/api/team.service.ts on purpose: that service is the
 * owner-only workspace member *management* (invite/list/cancel, all
 * authenticated). This one is the public, unauthenticated, token-based
 * self-registration call a brand-new member makes from the
 * /member/register/:token link in their invitation email — the exact
 * counterpart to services/api/client-registration.service.ts for the client
 * flow (POST /members/register vs POST /client/register).
 */
export const memberRegistrationService = {
  async register(payload: MemberRegisterRequest): Promise<MemberRegisterResponseData> {
    const response = await apiClient.post<ApiSuccessResponse<MemberRegisterResponseData>>(
      MEMBER_REGISTRATION_ENDPOINTS.register,
      payload,
    );
    return response.data.data;
  },
};
