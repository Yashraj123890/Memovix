"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { NOTIFICATION_TYPE_CONFIG } from "@/features/notifications/config/notification-type";
import { getNotificationHref } from "@/features/notifications/utils/get-notification-href";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onOpen: (id: string) => void;
}

/**
 * Reused by both NotificationBell (dropdown) and NotificationsContainer
 * (full page) — presentational only, doesn't call any hook itself.
 * `onOpen` fires the mark-as-read mutation (only when actually unread);
 * navigation itself is a plain Link, not intercepted.
 */
export function NotificationItem({ notification, onOpen }: NotificationItemProps) {
  const { icon: Icon, label } = NOTIFICATION_TYPE_CONFIG[notification.type];
  const href = getNotificationHref(notification);

  return (
    <Link
      href={href}
      onClick={() => {
        if (!notification.isRead) {
          onOpen(notification.id);
        }
      }}
      className="hover:bg-accent flex items-start gap-3 px-3 py-2.5 transition-colors"
    >
      <span
        className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground truncate text-sm font-medium">{notification.title}</p>
          <span className="text-muted-foreground shrink-0 text-[11px]">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-xs">{notification.message}</p>
        <span className="text-muted-foreground/70 text-[11px]">{label}</span>
      </div>

      <AnimatePresence>
        {!notification.isRead && (
          <motion.span
            key="unread-dot"
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </Link>
  );
}
