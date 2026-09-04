"use client";

import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FadeIn } from "@/components/motion/fade-in";
import { NotificationList } from "@/features/notifications/components/notification-list";
import { NotificationsSkeleton } from "@/features/notifications/components/notifications-skeleton";
import { useNotificationsQuery } from "@/features/notifications/hooks/use-notifications-query";
import { useMarkAsReadMutation } from "@/features/notifications/hooks/use-mark-as-read-mutation";
import { useMarkAllAsReadMutation } from "@/features/notifications/hooks/use-mark-all-as-read-mutation";
import { getUnreadCount } from "@/features/notifications/utils/get-unread-count";
import { getErrorMessage } from "@/utils/error";

/**
 * The full-history counterpart to NotificationBell — same
 * useNotificationsQuery/mutations, no separate fetch or cache.
 */
export function NotificationsContainer() {
  const { data: notifications, isLoading, isError, error, refetch } = useNotificationsQuery();
  const markAsRead = useMarkAsReadMutation();
  const markAllAsRead = useMarkAllAsReadMutation();

  const unreadCount = getUnreadCount(notifications);

  return (
    <div className="flex flex-col gap-4">
      {unreadCount > 0 && (
        <FadeIn className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()}>
            Mark all as read
          </Button>
        </FadeIn>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <NotificationsSkeleton />
          </CardContent>
        </Card>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : notifications && notifications.length > 0 ? (
        <FadeIn>
          <Card>
            <CardContent className="p-0">
              <NotificationList
                notifications={notifications}
                onOpen={(id) => markAsRead.mutate(id)}
              />
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn>
          <EmptyState
            icon={<BellIcon className="size-5" />}
            title="No notifications yet"
            description="Activity across your projects — new memories, files, comments and invitations — will show up here."
          />
        </FadeIn>
      )}
    </div>
  );
}
