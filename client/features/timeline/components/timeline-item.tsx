import { getActivityConfig, type ActivityTone } from "@/features/timeline/config/activity-config";
import { formatRelativeTime } from "@/utils/format-relative-time";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types/timeline";

interface TimelineItemProps {
  event: TimelineEvent;
  /** Hides the connecting line below the last item in the feed. */
  isLast?: boolean;
}

const TONE_CLASS: Record<ActivityTone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
  secondary: "bg-muted text-muted-foreground",
};

/**
 * Purely presentational — every action-specific decision (icon, label,
 * color) comes from ACTIVITY_CONFIG via getActivityConfig, so this
 * component has no branching on `event.action`.
 */
export function TimelineItem({ event, isLast = false }: TimelineItemProps) {
  const { icon: Icon, label, tone } = getActivityConfig(event.action);
  const actorName = event.user?.name ?? "Someone";

  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            TONE_CLASS[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {!isLast && <span className="bg-border w-px flex-1" aria-hidden="true" />}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 pb-6">
        <p className="text-sm">
          <span className="text-foreground font-medium">{actorName}</span>{" "}
          <span className="text-muted-foreground">{label}</span>
        </p>
        <p className="text-muted-foreground text-sm">{event.description}</p>
        <span className="text-muted-foreground text-xs">{formatRelativeTime(event.createdAt)}</span>
      </div>
    </li>
  );
}
