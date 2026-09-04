import Link from "next/link";
import {
  BellIcon,
  CheckCircle2Icon,
  FileTextIcon,
  MessageSquareIcon,
  NotebookPenIcon,
  RefreshCwIcon,
  SendIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NOTIFICATIONS_ROUTE } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { Notification, NotificationType } from "@/types/notification";

interface NotificationsSummaryProps {
  notifications: Notification[];
  isLoading: boolean;
  isError: boolean;
}

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  MEMORY_CREATED: NotebookPenIcon,
  FILE_UPLOADED: FileTextIcon,
  COMMENT_ADDED: MessageSquareIcon,
  MEMBER_INVITED: UserPlusIcon,
  CLIENT_INVITED: UserPlusIcon,
  DELIVERABLE_SUBMITTED: SendIcon,
  DELIVERABLE_APPROVED: CheckCircle2Icon,
  DELIVERABLE_REVISION_REQUESTED: RefreshCwIcon,
  SYSTEM: BellIcon,
};

export function NotificationsSummary({ notifications, isLoading, isError }: NotificationsSummaryProps) {
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const items = notifications.slice(0, 4);

  return (
    <SectionCard
      title="Notifications"
      description={isLoading ? undefined : unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
      action={
        <Link href={NOTIFICATIONS_ROUTE} className="text-primary text-xs font-medium hover:underline">
          View all
        </Link>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description="We couldn't load notifications." className="py-8" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BellIcon className="size-5" />}
          title="No notifications"
          description="You'll be notified about important workspace activity here."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((notification) => {
            // Fallback guards against any future backend type not yet mapped —
            // an unmapped icon must never crash the dashboard.
            const Icon = TYPE_ICON[notification.type] ?? BellIcon;
            return (
              <li key={notification.id} className="flex items-start gap-3">
                <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground truncate text-sm font-medium">{notification.title}</span>
                    {!notification.isRead && (
                      <span className="bg-primary size-1.5 shrink-0 rounded-full" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-muted-foreground truncate text-xs">{notification.message}</span>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
