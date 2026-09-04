import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { UserProfile } from "@/types/profile";

const PROFILE_ENDPOINTS = {
  me: "/users/me/profile",
  avatar: "/users/me/avatar",
} as const;

export interface UpdateProfilePayload {
  title?: string | null;
  about?: string | null;
}

/**
 * Current user's own profile. All endpoints are "me"-scoped server-side (keyed
 * off the access token), so there is no userId to pass. The avatar upload
 * overrides Content-Type to multipart for the same reason documented in
 * file.service.ts (axios would otherwise JSON.stringify the FormData).
 */
export const profileService = {
  async getMyProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiSuccessResponse<UserProfile>>(
      PROFILE_ENDPOINTS.me,
    );
    return response.data.data;
  },

  async updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await apiClient.patch<ApiSuccessResponse<UserProfile>>(
      PROFILE_ENDPOINTS.me,
      payload,
    );
    return response.data.data;
  },

  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiSuccessResponse<UserProfile>>(
      PROFILE_ENDPOINTS.avatar,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
  },
};
