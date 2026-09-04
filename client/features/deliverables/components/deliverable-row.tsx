import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeliverableStatusBadge } from "@/features/deliverables/components/deliverable-status-badge";
import type { DeliverableListItem } from "@/types/deliverable";

function formatDate(iso: string | null): string | null {
  return iso ? new Date(iso).toLocaleDateString() : null;
}

export function DeliverableRow({
  projectId,
  deliverable,
  isClient = false,
}: {
  projectId: string;
  deliverable: DeliverableListItem;
  /** When true (viewer is a CLIENT), a SUBMITTED deliverable is flagged as needing their review. */
  isClient?: boolean;
}) {
  const versionCount = deliverable._count.versions;
  const due = formatDate(deliverable.dueDate);
  // For a client, SUBMITTED is the one status that requires their action.
  const awaitingReview = isClient && deliverable.status === "SUBMITTED";

  return (
    <li>
      <Link
        href={`/projects/${projectId}/deliverables/${deliverable.id}`}
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 transition-colors",
          awaitingReview ? "bg-info/5 hover:bg-info/10" : "hover:bg-muted/50",
        )}
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{deliverable.title}</p>
          <p className="text-muted-foreground text-xs">
            {versionCount} version{versionCount === 1 ? "" : "s"}
            {due ? ` · Due ${due}` : ""}
          </p>
        </div>
        {awaitingReview ? (
          <Badge variant="info" className="shrink-0">
            Awaiting your review
          </Badge>
        ) : (
          <DeliverableStatusBadge status={deliverable.status} />
        )}
      </Link>
    </li>
  );
}
