"use client";

import { ClockIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TimelineList } from "@/features/timeline/components/timeline-list";
import { TimelineSkeleton } from "@/features/timeline/components/timeline-skeleton";
import { useTimelineQuery } from "@/features/timeline/hooks/use-timeline-query";
import { getErrorMessage } from "@/utils/error";

interface TimelineContainerProps {
  projectId: string;
}

/**
 * The only place in this feature that calls useTimelineQuery — switches
 * between loading/error/empty/list, same pattern as ProjectsView (F5).
 */
export function TimelineContainer({ projectId }: TimelineContainerProps) {
  const { data: events, isLoading, isError, error, refetch } = useTimelineQuery(projectId);

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (isError) {
    return <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={<ClockIcon className="size-5" />}
        title="No activity yet"
        description="Actions taken in this project — memories, files, comments — will show up here."
      />
    );
  }

  return (
    <Card>
      <CardContent>
        <TimelineList events={events} />
      </CardContent>
    </Card>
  );
}
