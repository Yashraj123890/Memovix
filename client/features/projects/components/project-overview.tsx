"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  CalendarIcon,
  ClockIcon,
  FolderIcon,
  NotebookPenIcon,
  PackageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PROJECT_STATUS_BADGE_VARIANT } from "@/features/projects/config/status-filter";
import { useDeliverablesQuery } from "@/features/deliverables/hooks/use-deliverables-query";
import { useFilesQuery } from "@/features/files/hooks/use-files-query";
import { useMemoriesQuery } from "@/features/memories/hooks/use-memories-query";
import { useTimelineQuery } from "@/features/timeline/hooks/use-timeline-query";
import { getActivityConfig } from "@/features/timeline/config/activity-config";
import { formatRelativeTime } from "@/utils/format-relative-time";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectOverviewProps {
  project: Project;
}

const RECENT_ACTIVITY_LIMIT = 5;

const TONE_DOT: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  secondary: "bg-muted-foreground",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * At-a-glance landing tab for a project. Every number and event here is real:
 * the counts reuse the exact same query keys as the Deliverables/Files/Memories
 * tabs, and Recent Activity reuses the project Timeline (useTimelineQuery) — so
 * this warms/reads the same cache rather than adding new endpoints. All of these
 * routes are reachable by any assigned role (OWNER/MEMBER/CLIENT), so no data is
 * invented and nothing role-restricted is exposed. The former "Client: Not
 * available yet" card was removed — there is no owner-facing project-client
 * endpoint, so a placeholder there would have been misleading.
 */
export function ProjectOverview({ project }: ProjectOverviewProps) {
  const deliverables = useDeliverablesQuery(project.id);
  const files = useFilesQuery(project.id);
  const memories = useMemoriesQuery(project.id, "");
  const timeline = useTimelineQuery(project.id);

  const recentEvents = timeline.data?.slice(0, RECENT_ACTIVITY_LIMIT) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Count stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CountStat label="Deliverables" icon={<PackageIcon className="size-4" />} query={deliverables} />
        <CountStat label="Files" icon={<FolderIcon className="size-4" />} query={files} />
        <CountStat label="Memories" icon={<NotebookPenIcon className="size-4" />} query={memories} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Details */}
        <SectionCard title="Details" className="lg:col-span-1">
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Status</dt>
              <dd>
                <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]} className="capitalize">
                  {project.status.toLowerCase()}
                </Badge>
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Created</dt>
              <dd className="text-foreground flex items-center gap-1.5 text-sm">
                <CalendarIcon className="size-3.5" aria-hidden="true" />
                {formatDate(project.createdAt)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Last updated</dt>
              <dd className="text-foreground flex items-center gap-1.5 text-sm">
                <ClockIcon className="size-3.5" aria-hidden="true" />
                {formatDate(project.updatedAt)}
              </dd>
            </div>
          </dl>
        </SectionCard>

        {/* Recent activity */}
        <SectionCard
          title="Recent activity"
          description="Latest updates in this project"
          className="lg:col-span-2"
          action={
            <Link
              href={`/projects/${project.id}/timeline`}
              className="text-primary text-xs font-medium hover:underline"
            >
              View all
            </Link>
          }
        >
          {timeline.isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : timeline.isError ? (
            <ErrorState
              description="We couldn't load recent activity."
              className="py-8"
              onRetry={() => timeline.refetch()}
            />
          ) : recentEvents.length === 0 ? (
            <EmptyState
              icon={<ActivityIcon className="size-5" />}
              title="No activity yet"
              description="Actions taken in this project will show up here as they happen."
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {recentEvents.map((event, index) => {
                const { label, tone } = getActivityConfig(event.action);
                const actorName = event.user?.name ?? "Someone";

                return (
                  <li key={event.id} className="relative flex gap-3 pl-1">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", TONE_DOT[tone])}
                        aria-hidden="true"
                      />
                      {index < recentEvents.length - 1 && (
                        <span className="bg-border mt-1 w-px flex-1" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-1">
                      <p className="text-foreground text-sm">
                        <span className="font-medium">{actorName}</span>{" "}
                        <span className="text-muted-foreground">{label}</span>
                      </p>
                      <p className="text-muted-foreground text-sm">{event.description}</p>
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(event.createdAt)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

interface CountQuery {
  isLoading: boolean;
  isError: boolean;
  data?: readonly unknown[];
}

/** A single count tile — real length from an existing query, with graceful loading/error. */
function CountStat({
  label,
  icon,
  query,
}: {
  label: string;
  icon: ReactNode;
  query: CountQuery;
}) {
  if (query.isLoading) {
    return (
      <div className="border-border flex flex-col gap-1 rounded-lg border p-4">
        <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
          <span>{label}</span>
          {icon}
        </div>
        <Skeleton className="h-7 w-10" />
      </div>
    );
  }

  const value = query.isError ? "—" : (query.data?.length ?? 0);
  return <StatCard label={label} value={value} icon={icon} />;
}
