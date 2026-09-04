"use client";

import { useMemo, useState } from "react";
import { ClipboardCheckIcon, PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useAuthStore } from "@/stores/auth.store";
import { useDeliverablesQuery } from "@/features/deliverables/hooks/use-deliverables-query";
import { DeliverableFormDialog } from "@/features/deliverables/components/deliverable-form-dialog";
import { DeliverablesSkeleton } from "@/features/deliverables/components/deliverables-skeleton";
import { DeliverableRow } from "@/features/deliverables/components/deliverable-row";
import { getErrorMessage } from "@/utils/error";

interface DeliverablesContainerProps {
  projectId: string;
}

/**
 * List view for a project's deliverables. Create is OWNER/MEMBER-only. A CLIENT
 * sees a read-only list, but SUBMITTED deliverables are the ones awaiting their
 * approve/request-changes decision — so for a client those are summarized in a
 * banner, sorted to the top, and flagged per-row (see DeliverableRow). Same
 * container shape as FilesContainer.
 */
export function DeliverablesContainer({ projectId }: DeliverablesContainerProps) {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "MEMBER";
  const isClient = role === "CLIENT";
  const [createOpen, setCreateOpen] = useState(false);

  const { data: deliverables, isLoading, isError, error, refetch } =
    useDeliverablesQuery(projectId);
  const hasDeliverables = (deliverables?.length ?? 0) > 0;

  // Client-only: how many deliverables are waiting on this client's review.
  const awaitingReviewCount = isClient
    ? (deliverables?.filter((d) => d.status === "SUBMITTED").length ?? 0)
    : 0;

  // Client-only: float the deliverables that need review to the top; otherwise
  // keep the backend order (created desc). Display-only — no data is changed.
  const orderedDeliverables = useMemo(() => {
    if (!deliverables) return [];
    if (!isClient) return deliverables;
    return [...deliverables].sort((a, b) => {
      const aReview = a.status === "SUBMITTED" ? 0 : 1;
      const bReview = b.status === "SUBMITTED" ? 0 : 1;
      return aReview - bReview;
    });
  }, [deliverables, isClient]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Deliverables</h2>
          <p className="text-muted-foreground text-sm">
            Work products shared with the client, with full version history.
          </p>
        </div>
        {canManage && <Button onClick={() => setCreateOpen(true)}>New deliverable</Button>}
      </div>

      {awaitingReviewCount > 0 && (
        <div className="border-info/30 bg-info/5 flex items-start gap-3 rounded-xl border p-4">
          <ClipboardCheckIcon className="text-info mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-foreground text-sm font-medium">
              {awaitingReviewCount} deliverable{awaitingReviewCount === 1 ? "" : "s"} awaiting your
              review
            </p>
            <p className="text-muted-foreground text-sm">
              Open a deliverable below to approve it or request changes.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <DeliverablesSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !hasDeliverables ? (
        <EmptyState
          icon={<PackageIcon className="size-5" />}
          title="No deliverables yet"
          description={
            canManage
              ? "Create a deliverable to start sharing work products with the client."
              : "No deliverables have been shared with you yet."
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-border divide-y">
              {orderedDeliverables.map((deliverable) => (
                <DeliverableRow
                  key={deliverable.id}
                  projectId={projectId}
                  deliverable={deliverable}
                  isClient={isClient}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {canManage && (
        <DeliverableFormDialog open={createOpen} onOpenChange={setCreateOpen} projectId={projectId} />
      )}
    </div>
  );
}
