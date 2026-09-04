"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { BellIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationList } from "@/features/notifications/components/notification-list";
import { NotificationsSkeleton } from "@/features/notifications/components/notifications-skeleton";
import { useNotificationsQuery } from "@/features/notifications/hooks/use-notifications-query";
import { useMarkAsReadMutation } from "@/features/notifications/hooks/use-mark-as-read-mutation";
import { useMarkAllAsReadMutation } from "@/features/notifications/hooks/use-mark-all-as-read-mutation";
import { getUnreadCount } from "@/features/notifications/utils/get-unread-count";
import { NOTIFICATIONS_ROUTE } from "@/constants/routes";

const DROPDOWN_LIMIT = 8;

/**
 * Header trigger + compact preview panel — full history lives at
 * /notifications (NotificationsContainer). Both share useNotificationsQuery
 * and the same mark-as-read mutations, so read state stays in sync
 * whichever surface the user acts from.
 */
export function NotificationBell() {
  const { data: notifications, isLoading } = useNotificationsQuery();
  const markAsRead = useMarkAsReadMutation();
  const markAllAsRead = useMarkAllAsReadMutation();

  const unreadCount = getUnreadCount(notifications);
  const recent = notifications?.slice(0, DROPDOWN_LIMIT) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-accent focus-visible:ring-ring focus-visible:ring-offset-background relative flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label={unreadCount > 0 ? `Open notifications (${unreadCount} unread)` : "Open notifications"}
      >
        <BellIcon className="text-muted-foreground size-4" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="unread-count"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-foreground text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-normal"
              onClick={() => markAllAsRead.mutate()}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <NotificationsSkeleton count={4} />
          ) : recent.length === 0 ? (
            <EmptyState
              icon={<BellIcon className="size-5" />}
              title="No notifications yet"
              description="You're all caught up."
              className="border-none px-3 py-8"
            />
          ) : (
            <NotificationList notifications={recent} onOpen={(id) => markAsRead.mutate(id)} />
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <Link
          href={NOTIFICATIONS_ROUTE}
          className="text-muted-foreground hover:text-foreground block px-3 py-2.5 text-center text-xs font-medium transition-colors"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
