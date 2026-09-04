"use client";

import { useState } from "react";
import { CheckCircle2Icon, PencilIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApproveDeliverableMutation } from "@/features/deliverables/hooks/use-approve-deliverable-mutation";
import { RequestRevisionDialog } from "@/features/deliverables/components/request-revision-dialog";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { DeliverableStatus } from "@/types/deliverable";

interface DeliverableReviewPanelProps {
  projectId: string;
  deliverableId: string;
  title: string;
  status: DeliverableStatus;
  approvedAt: string | null;
  latestRevisionComment: string | null;
}

type Tone = "approve" | "changes";

const ACTIONS: {
  tone: Tone;
  label: string;
  description: string;
  icon: LucideIcon;
  card: string;
  iccolor: string;
}[] = [
  {
    tone: "approve",
    label: "Approve",
    description: "Looks good! Mark this deliverable as approved.",
    icon: CheckCircle2Icon,
    card: "border-success/20 bg-success/5 hover:bg-success/10 focus-visible:ring-success/40",
    iccolor: "text-success",
  },
  {
    tone: "changes",
    label: "Request Changes",
    description: "Request modifications or improvements.",
    icon: PencilIcon,
    card: "border-warning/25 bg-warning/5 hover:bg-warning/10 focus-visible:ring-warning/40",
    iccolor: "text-warning",
  },
];

/**
 * The "Your Review" section a CLIENT sees. When the deliverable is SUBMITTED it
 * shows the two action cards (Approve / Request Changes); otherwise it adapts to
 * the current outcome. Approve -> POST /approve; Request Changes ->
 * POST /request-revision. Both act on the current (latest) version.
 */
export function DeliverableReviewPanel({
  projectId,
  deliverableId,
  title,
  status,
  approvedAt,
  latestRevisionComment,
}: DeliverableReviewPanelProps) {
  const approve = useApproveDeliverableMutation(projectId, deliverableId);
  const [approveOpen, setApproveOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);

  const isActionable = status === "SUBMITTED";

  return (
    <section
      aria-label="Your review"
      className="border-border bg-card rounded-xl border p-5 shadow-sm"
    >
      <h2 className="text-foreground text-base font-semibold">Your Review</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {isActionable
          ? "Please review this deliverable and provide your feedback."
          : REVIEW_HINT[status]}
      </p>

      {status === "APPROVED" ? (
        <OutcomeRow
          tone="approve"
          icon={CheckCircle2Icon}
          title="You approved this deliverable"
          detail={approvedAt ? `Approved ${formatRelativeTime(approvedAt)}` : undefined}
        />
      ) : status === "REVISION_REQUESTED" ? (
        <OutcomeRow
          tone="changes"
          icon={PencilIcon}
          title="You requested changes"
          detail={latestRevisionComment ?? undefined}
        />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tone}
                type="button"
                disabled={!isActionable}
                onClick={() => {
                  if (action.tone === "approve") setApproveOpen(true);
                  else setRevisionOpen(true);
                }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
                  action.card,
                )}
              >
                <Icon className={cn("size-7", action.iccolor)} aria-hidden="true" />
                <span className="text-foreground text-sm font-semibold">{action.label}</span>
                <span className="text-muted-foreground text-xs">{action.description}</span>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve deliverable</DialogTitle>
            <DialogDescription>
              Approve “{title}”? This records your sign-off and notifies the team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              loading={approve.isPending}
              onClick={() => approve.mutate(undefined, { onSuccess: () => setApproveOpen(false) })}
            >
              <CheckCircle2Icon className="size-4" aria-hidden="true" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RequestRevisionDialog
        open={revisionOpen}
        onOpenChange={setRevisionOpen}
        projectId={projectId}
        deliverableId={deliverableId}
      />
    </section>
  );
}

const REVIEW_HINT: Record<DeliverableStatus, string> = {
  DRAFT: "This deliverable hasn’t been submitted for review yet.",
  SUBMITTED: "Please review this deliverable and provide your feedback.",
  APPROVED: "This deliverable has been approved.",
  REVISION_REQUESTED: "You’ve sent this deliverable back to the team.",
};

function OutcomeRow({
  tone,
  icon: Icon,
  title,
  detail,
}: {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  detail?: string;
}) {
  const toneClass =
    tone === "approve"
      ? "border-success/20 bg-success/5 text-success"
      : "border-warning/25 bg-warning/5 text-warning";

  return (
    <div className={cn("mt-4 flex items-start gap-3 rounded-lg border p-4", toneClass)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-foreground text-sm font-medium">{title}</p>
        {detail && (
          <p className="text-foreground/90 mt-1 text-sm whitespace-pre-wrap">{detail}</p>
        )}
      </div>
    </div>
  );
}
