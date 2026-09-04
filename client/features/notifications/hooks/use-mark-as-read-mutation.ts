"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/api/notification.service";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";
import type { Notification } from "@/types/notification";

/**
 * Optimistic — marking a notification read is a low-friction, expected
 * interaction (like reading an email), so it updates the cached list
 * immediately rather than waiting on a round trip, with rollback on
 * failure. No toast: this isn't consequential enough to warrant one
 * (unlike F10's Add/Remove Member or F11's Add/Delete Comment) — the
 * unread dot's own exit animation is the feedback.
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<Notification[]>(notificationKeys.list());

      queryClient.setQueryData<Notification[]>(notificationKeys.list(), (old) =>
        old?.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        ),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}
