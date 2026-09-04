"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { profileService } from "@/services/api/profile.service";
import { profileKeys } from "@/features/settings/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";

/** Upload/replace the current user's profile photo. */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me, profile);
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success("Profile photo updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
