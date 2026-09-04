"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/api/notification.service";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";
import type { Notification } from "@/types/notification";

/** Same optimistic-update rationale as useMarkAsReadMutation. */
export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<Notification[]>(notificationKeys.list());

      queryClient.setQueryData<Notification[]>(notificationKeys.list(), (old) =>
        old?.map((notification) => ({ ...notification, isRead: true })),
      );

      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}
