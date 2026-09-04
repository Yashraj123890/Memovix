"use client";

import { useState } from "react";
import { ShieldAlertIcon, GitCompareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { getErrorMessage } from "@/utils/error";
import { useScopeFlagsQuery } from "@/features/scope/hooks/use-scope-flags-query";
import { useCompareBaselineMutation } from "@/features/scope/hooks/use-scope-mutations";
import { ScopeFlagCard } from "@/features/scope/components/scope-flag-card";
import { ScopeFlagsSkeleton } from "@/features/scope/components/scope-flags-skeleton";
import { ResolutionFilter } from "@/features/scope/components/resolution-filter";
import type { ResolutionFilterValue } from "@/features/scope/config/scope";

interface ScopeFlagsDashboardProps {
  projectId: string;
  canManage: boolean;
  /** Size of the Baseline Scope — the comparison needs at least one. */
  baselineCount: number;
  /** Number of New Requests (non-baseline candidates) available to compare. */
  candidateCount: number;
}

/**
 * Scope Creep Detection dashboard (blueprint §3.2.6), rendered inside the
 * Requirements tab. "Compare to baseline" runs the pipeline; flags are listed
 * with their classification, similarity and rationale, and (for pending flags)
 * resolution actions. Never communicates with the client.
 *
 * The comparison only produces flags when a baseline exists AND there is at
 * least one New Request to check against it. When either is missing, the button
 * is disabled with a hint — otherwise a run silently does nothing, which reads
 * as "the feature is broken".
 */
export function ScopeFlagsDashboard({
  projectId,
  canManage,
  baselineCount,
  candidateCount,
}: ScopeFlagsDashboardProps) {
  const [filter, setFilter] = useState<ResolutionFilterValue>("ALL");
  const resolution = filter === "ALL" ? undefined : filter;

  const {
    data: flags,
    isLoading,
    isError,
    error,
    refetch,
  } = useScopeFlagsQuery(projectId, resolution);
  const compare = useCompareBaselineMutation(projectId);

  const hasFlags = (flags?.length ?? 0) > 0;

  // The comparison needs a baseline AND at least one non-baseline candidate.
  const compareBlockedReason =
    baselineCount === 0
      ? "Set a Baseline Scope first."
      : candidateCount === 0
        ? "No new requests to compare — add one above."
        : null;
  const canCompare = compareBlockedReason === null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlertIcon
              className="text-muted-foreground size-4"
              aria-hidden="true"
            />
            Scope Flags
          </h3>
          <p className="text-muted-foreground text-sm">
            New requirements that expand or modify the agreed baseline scope.
          </p>
        </div>
        {canManage && (
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="outline"
              onClick={() => compare.mutate()}
              loading={compare.isPending}
              disabled={compare.isPending || !canCompare}
              title={compareBlockedReason ?? undefined}
            >
              <GitCompareIcon aria-hidden="true" />
              Compare to baseline
            </Button>
            {compareBlockedReason && (
              <p className="text-muted-foreground text-xs">
                {compareBlockedReason}
              </p>
            )}
          </div>
        )}
      </div>

      <ResolutionFilter value={filter} onChange={setFilter} />

      {isLoading ? (
        <ScopeFlagsSkeleton />
      ) : isError ? (
        <ErrorState
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : !hasFlags ? (
        <EmptyState
          icon={<ShieldAlertIcon className="size-5" />}
          title={filter === "ALL" ? "No scope flags" : "No flags in this state"}
          description={
            canManage
              ? "Run “Compare to baseline” to check non-baseline requirements against the Baseline Scope."
              : "Scope-creep flags will appear here when new requirements diverge from the baseline."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {flags!.map((flag) => (
            <ScopeFlagCard
              key={flag.id}
              projectId={projectId}
              flag={flag}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </section>
  );
}
