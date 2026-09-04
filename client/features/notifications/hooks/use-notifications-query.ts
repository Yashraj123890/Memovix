"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/api/notification.service";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";

/**
 * Single source of truth for both the header dropdown (NotificationBell)
 * and the full /notifications page — GET /notifications already returns
 * the user's complete history with no pagination, so there's no
 * performance reason to also call GET /notifications/unread separately;
 * unread count/filtering is derived client-side (see utils/get-unread-count.ts)
 * from this one cached list, which also keeps mark-as-read invalidation
 * to a single query key.
 */
export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationService.getNotifications(),
  });
}
