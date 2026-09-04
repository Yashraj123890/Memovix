import { TimelineItem } from "@/features/timeline/components/timeline-item";
import type { TimelineEvent } from "@/types/timeline";

interface TimelineListProps {
  events: TimelineEvent[];
}

/**
 * Flat, reverse-chronological list (already sorted by the backend — see
 * timelineRepository.ts findAllByProject). No date-grouping, no
 * virtualization: both explicitly out of scope for F7. Kept as its own
 * component specifically so either can be added later — a grouped-by-day
 * variant, or swapping this <ul> for a virtualized list — without
 * touching TimelineItem or the query hook.
 */
export function TimelineList({ events }: TimelineListProps) {
  return (
    <ul className="flex flex-col">
      {events.map((event, index) => (
        <TimelineItem key={event.id} event={event} isLast={index === events.length - 1} />
      ))}
    </ul>
  );
}
