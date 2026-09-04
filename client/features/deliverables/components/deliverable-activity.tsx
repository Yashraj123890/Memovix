"use client";

import {
  CheckCircle2Icon,
  PlusIcon,
  PencilIcon,
  SendIcon,
  UploadIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeliverableDetail, RevisionRequest } from "@/types/deliverable";

interface DeliverableActivityProps {
  deliverable: DeliverableDetail;
  revisionRequests: RevisionRequest[];
}

interface ActivityEvent {
  id: string;
  icon: LucideIcon;
  iconClass: string;
  title: string;
  at: string;
}

/** "Aug 2, 2026 · 10:30 AM" */
function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

/**
 * Activity feed derived from the deliverable's own persisted data (creation,
 * versions, submission, revision requests, approval) — not a separate activity
 * system. Ordered oldest-first, matching the reference layout.
 */
export function DeliverableActivity({ deliverable, revisionRequests }: DeliverableActivityProps) {
  const events = buildEvents(deliverable, revisionRequests);

  if (events.length === 0) {
    return <p className="text-muted-foreground text-sm">No activity yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {events.map((event) => {
        const Icon = event.icon;
        return (
          <li key={event.id} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                event.iconClass,
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium">{event.title}</p>
              <time className="text-muted-foreground text-xs" dateTime={event.at}>
                {formatDateTime(event.at)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const BLUE = "bg-primary/10 text-primary";

function buildEvents(
  deliverable: DeliverableDetail,
  revisionRequests: RevisionRequest[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  events.push({
    id: `created-${deliverable.id}`,
    icon: PlusIcon,
    iconClass: BLUE,
    title: "Deliverable created",
    at: deliverable.createdAt,
  });

  // Oldest version first so the feed reads chronologically.
  for (const version of [...deliverable.versions].reverse()) {
    events.push({
      id: `version-${version.id}`,
      icon: UploadIcon,
      iconClass: BLUE,
      title: `Version v${version.versionNumber} uploaded`,
      at: version.uploadedAt,
    });
  }

  if (deliverable.submittedAt) {
    events.push({
      id: `submitted-${deliverable.id}`,
      icon: SendIcon,
      iconClass: BLUE,
      title: "Submitted for review",
      at: deliverable.submittedAt,
    });
  }

  for (const revision of revisionRequests) {
    events.push({
      id: `revision-${revision.id}`,
      icon: PencilIcon,
      iconClass: "bg-warning/10 text-warning",
      title: "Changes requested",
      at: revision.createdAt,
    });
  }

  if (deliverable.approvedAt) {
    events.push({
      id: `approved-${deliverable.id}`,
      icon: CheckCircle2Icon,
      iconClass: "bg-success/10 text-success",
      title: "Deliverable approved",
      at: deliverable.approvedAt,
    });
  }

  // Oldest first.
  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}
