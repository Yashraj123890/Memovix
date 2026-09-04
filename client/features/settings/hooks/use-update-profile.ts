"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { profileService, type UpdateProfilePayload } from "@/services/api/profile.service";
import { profileKeys } from "@/features/settings/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

/** Update the current user's Title / About. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateMyProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me, profile);
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
