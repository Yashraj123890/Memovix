"use client";

import { useState } from "react";
import { ScrollTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useAuthStore } from "@/stores/auth.store";
import { useDecisionsQuery } from "@/features/decisions/hooks/use-decisions-query";
import { AddDecisionDialog } from "@/features/decisions/components/add-decision-dialog";
import { DecisionsSkeleton } from "@/features/decisions/components/decisions-skeleton";
import { DecisionRow } from "@/features/decisions/components/decision-row";
import {
  DecisionCategoryFilter,
  type DecisionCategoryFilterValue,
} from "@/features/decisions/components/decision-category-filter";
import { getErrorMessage } from "@/utils/error";

interface DecisionsContainerProps {
  projectId: string;
}

/**
 * Decision Log list. Reads visible to all project roles; manual entries are
 * OWNER/MEMBER-only. Same container shape as DeliverablesContainer.
 */
export function DecisionsContainer({ projectId }: DecisionsContainerProps) {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "MEMBER";

  const [filter, setFilter] = useState<DecisionCategoryFilterValue>("ALL");
  const [addOpen, setAddOpen] = useState(false);

  const category = filter === "ALL" ? undefined : filter;
  const { data: decisions, isLoading, isError, error, refetch } =
    useDecisionsQuery(projectId, category);
  const hasDecisions = (decisions?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Decision Log</h2>
          <p className="text-muted-foreground text-sm">
            The permanent record of key project decisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DecisionCategoryFilter value={filter} onChange={setFilter} />
          {canManage && <Button onClick={() => setAddOpen(true)}>Log decision</Button>}
        </div>
      </div>

      {isLoading ? (
        <DecisionsSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !hasDecisions ? (
        <EmptyState
          icon={<ScrollTextIcon className="size-5" />}
          title={filter === "ALL" ? "No decisions logged yet" : "No decisions in this category"}
          description={
            canManage
              ? "Log a decision to start building this project's permanent record."
              : "Key project decisions will appear here as they're made."
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-border divide-y">
              {decisions!.map((decision) => (
                <DecisionRow key={decision.id} decision={decision} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {canManage && (
        <AddDecisionDialog open={addOpen} onOpenChange={setAddOpen} projectId={projectId} />
      )}
    </div>
  );
}
