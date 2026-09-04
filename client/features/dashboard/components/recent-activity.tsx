import { ActivityIcon } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivityConfig } from "@/features/timeline/config/activity-config";
import { formatRelativeTime } from "@/utils/format-relative-time";
import { cn } from "@/lib/utils";
import type { DashboardActivityItem } from "@/types/dashboard";

interface RecentActivityProps {
  activity: DashboardActivityItem[];
  isLoading: boolean;
  isError: boolean;
}

const TONE_CLASS: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  secondary: "bg-muted-foreground",
};

/**
 * Reuses getActivityConfig from the real per-project Timeline feature
 * (features/timeline/config/activity-config.ts) rather than inventing a
 * second action->label mapping — each event's `action`/`description` are
 * the real values the backend writes (server/src/services/*.service.ts),
 * same as TimelineItem renders on a project's own Timeline tab.
 */
export function RecentActivity({ activity, isLoading, isError }: RecentActivityProps) {
  return (
    <SectionCard title="Recent activity" description="Latest updates across your workspace">
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          description="We couldn't load recent activity."
          className="py-8"
        />
      ) : activity.length === 0 ? (
        <EmptyState
          icon={<ActivityIcon className="size-5" />}
          title="No activity yet"
          description="Actions your team takes will show up here as they happen."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {activity.map((item, index) => {
            const { label, tone } = getActivityConfig(item.action);
            const actorName = item.user?.name ?? "Someone";

            return (
              <li key={item.id} className="relative flex gap-3 pl-1">
                <div className="flex flex-col items-center">
                  <span
                    className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", TONE_CLASS[tone])}
                    aria-hidden="true"
                  />
                  {index < activity.length - 1 && (
                    <span className="bg-border mt-1 w-px flex-1" aria-hidden="true" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-1">
                  <p className="text-foreground text-sm">
                    <span className="font-medium">{actorName}</span>{" "}
                    <span className="text-muted-foreground">{label}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.projectName} · {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
