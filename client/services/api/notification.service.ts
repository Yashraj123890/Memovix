import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { Notification } from "@/types/notification";

const NOTIFICATION_ENDPOINTS = {
  list: "/notifications",
  unread: "/notifications/unread",
  markAsRead: (id: string) => `/notifications/${id}/read`,
  markAllAsRead: "/notifications/read-all",
} as const;

/**
 * server/src/routes/notification.routes.ts exposes GET / and GET /unread
 * as two separate endpoints, but neither takes pagination/filter params —
 * both return the user's entire notification history. The frontend only
 * uses the full list (see use-notifications-query.ts) and derives unread
 * state client-side, so getUnreadNotifications isn't consumed by any hook
 * yet; it's still exposed here since it's a real, distinct backend
 * endpoint a future feature (e.g. a lighter-weight unread-only fetch)
 * could use without adding a new service method.
 */
export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<ApiSuccessResponse<Notification[]>>(
      NOTIFICATION_ENDPOINTS.list,
    );
    return response.data.data;
  },

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<ApiSuccessResponse<Notification[]>>(
      NOTIFICATION_ENDPOINTS.unread,
    );
    return response.data.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiSuccessResponse<Notification>>(
      NOTIFICATION_ENDPOINTS.markAsRead(id),
    );
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch(NOTIFICATION_ENDPOINTS.markAllAsRead);
  },
};
