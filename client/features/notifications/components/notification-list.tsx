"use client";

import { AnimatePresence } from "motion/react";
import { StaggerItem } from "@/components/motion/stagger-item";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import type { Notification } from "@/types/notification";

interface NotificationListProps {
  notifications: Notification[];
  onOpen: (id: string) => void;
}

export function NotificationList({ notifications, onOpen }: NotificationListProps) {
  return (
    <ul className="divide-border flex flex-col divide-y">
      <AnimatePresence initial={false}>
        {notifications.map((notification, index) => (
          <StaggerItem key={notification.id} index={index}>
            <NotificationItem notification={notification} onOpen={onOpen} />
          </StaggerItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
