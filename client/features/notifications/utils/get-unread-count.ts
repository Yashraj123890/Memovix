import type { Notification } from "@/types/notification";

export function getUnreadCount(notifications: Notification[] | undefined): number {
  return notifications?.filter((notification) => !notification.isRead).length ?? 0;
}
