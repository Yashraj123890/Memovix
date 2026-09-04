"use client";

import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/api/profile.service";
import { profileKeys } from "@/features/settings/hooks/query-keys";
import { useAuthStore } from "@/stores/auth.store";

/**
 * The signed-in user's own profile (title/about + avatar). Used by both the
 * Settings page and the header avatar, so the photo appears everywhere. The
 * avatar URL is a 1-hour signed URL; refetch-on-focus keeps it fresh across
 * long-lived tabs.
 */
export function useProfile() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: profileKeys.me,
    queryFn: () => profileService.getMyProfile(),
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
