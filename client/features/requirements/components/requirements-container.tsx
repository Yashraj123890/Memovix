"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ListChecksIcon,
  SparklesIcon,
  FlagIcon,
  FilePlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShieldCheckIcon,
  InboxIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/utils/error";
import { useRequirementsQuery } from "@/features/requirements/hooks/use-requirements-query";
import {
  useSetBaselineMutation,
  useMoveRequirementLaneMutation,
} from "@/features/requirements/hooks/use-requirement-mutations";
import { RequirementsTable } from "@/features/requirements/components/requirements-table";
import { RequirementsSkeleton } from "@/features/requirements/components/requirements-skeleton";
import { ExtractRequirementsDialog } from "@/features/requirements/components/extract-requirements-dialog";
import { AddRequestDialog } from "@/features/requirements/components/add-request-dialog";
import { EditRequirementDialog } from "@/features/requirements/components/edit-requirement-dialog";
import { DeleteRequirementDialog } from "@/features/requirements/components/delete-requirement-dialog";
import { ScopeFlagsDashboard } from "@/features/scope/components/scope-flags-dashboard";
import { Separator } from "@/components/ui/separator";
import type { Requirement } from "@/types/requirement";

interface RequirementsContainerProps {
  projectId: string;
}

function sameIds(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

/**
 * Structured Requirements tab (blueprint §3.2.4). Lists persisted requirements,
 * runs the extract → review → accept flow, supports edit/delete, and manages the
 * Baseline Scope.
 *
 * Two-lane model (Scope Creep intake): once a Baseline Scope exists, requirements
 * split into the agreed **Baseline Scope** and the **New Requests** lane
 * (non-baseline candidates). "Compare to baseline" runs on the New Requests, and
 * flags surface in the ScopeFlagsDashboard below. Before any baseline is set, the
 * original select-and-"Set as baseline" flow establishes the initial baseline.
 */
export function RequirementsContainer({
  projectId,
}: RequirementsContainerProps) {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "MEMBER";

  const {
    data: requirements,
    isLoading,
    isError,
    error,
    refetch,
  } = useRequirementsQuery(projectId);
  const setBaseline = useSetBaselineMutation(projectId);
  const moveLane = useMoveRequirementLaneMutation(projectId);

  const [extractOpen, setExtractOpen] = useState(false);
  const [addRequestOpen, setAddRequestOpen] = useState(false);
  const [editing, setEditing] = useState<Requirement | null>(null);
  const [deleting, setDeleting] = useState<Requirement | null>(null);

  const serverBaselineIds = useMemo(
    () =>
      new Set(
        (requirements ?? []).filter((r) => r.isBaseline).map((r) => r.id),
      ),
    [requirements],
  );

  const [selectedBaselineIds, setSelectedBaselineIds] = useState<Set<string>>(
    new Set(),
  );

  // Re-sync the baseline selection whenever the persisted set changes (initial
  // load and after a successful "Set as baseline").
  useEffect(() => {
    setSelectedBaselineIds(new Set(serverBaselineIds));
  }, [serverBaselineIds]);

  function toggleBaseline(requirementId: string) {
    setSelectedBaselineIds((prev) => {
      const next = new Set(prev);
      if (next.has(requirementId)) next.delete(requirementId);
      else next.add(requirementId);
      return next;
    });
  }

  const baselineDirty = !sameIds(selectedBaselineIds, serverBaselineIds);
  const hasRequirements = (requirements?.length ?? 0) > 0;

  // Split into the two lanes. A baseline "exists" once at least one requirement
  // is marked as baseline — that switch flips the UI from the initial
  // select-and-set flow to the two-lane (Baseline / New Requests) view.
  const baselineRequirements = useMemo(
    () => (requirements ?? []).filter((r) => r.isBaseline),
    [requirements],
  );
  const requestRequirements = useMemo(
    () => (requirements ?? []).filter((r) => !r.isBaseline),
    [requirements],
  );
  const hasBaseline = baselineRequirements.length > 0;

  const movingId = moveLane.isPending ? moveLane.variables?.requirementId : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Requirements</h2>
          <p className="text-muted-foreground text-sm">
            Structured requirements and the project&apos;s Baseline Scope.
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setAddRequestOpen(true)}>
              <FilePlusIcon aria-hidden="true" />
              Add new request
            </Button>
            <Button onClick={() => setExtractOpen(true)}>
              <SparklesIcon aria-hidden="true" />
              Extract requirements
            </Button>
          </div>
        )}
      </div>

      {/* Initial baseline setup: the select + "Set as baseline" bar shows only
          before any baseline exists. Once set, per-row lane moves take over. */}
      {canManage && hasRequirements && !hasBaseline && (
        <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <FlagIcon
              className="text-muted-foreground size-4"
              aria-hidden="true"
            />
            <span>
              {selectedBaselineIds.size} requirement
              {selectedBaselineIds.size === 1 ? "" : "s"} selected for the
              Baseline Scope
            </span>
          </div>
          <Button
            size="sm"
            disabled={
              !baselineDirty ||
              selectedBaselineIds.size === 0 ||
              setBaseline.isPending
            }
            loading={setBaseline.isPending}
            onClick={() => setBaseline.mutate(Array.from(selectedBaselineIds))}
          >
            Set as baseline
          </Button>
        </div>
      )}

      {isLoading ? (
        <RequirementsSkeleton />
      ) : isError ? (
        <ErrorState
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : !hasRequirements ? (
        <EmptyState
          icon={<ListChecksIcon className="size-5" />}
          title="No requirements yet"
          description={
            canManage
              ? "Extract requirements from a document or project memory to get started."
              : "Structured requirements will appear here once the team adds them."
          }
          action={
            canManage ? (
              <Button onClick={() => setExtractOpen(true)}>
                <SparklesIcon aria-hidden="true" />
                Extract requirements
              </Button>
            ) : undefined
          }
        />
      ) : !hasBaseline ? (
        // Initial setup: one table with the baseline checkbox selector.
        <Card>
          <CardContent className="p-0">
            <RequirementsTable
              requirements={requirements!}
              canManage={canManage}
              selectedBaselineIds={selectedBaselineIds}
              onToggleBaseline={toggleBaseline}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          </CardContent>
        </Card>
      ) : (
        // Two-lane view: Baseline Scope + New Requests.
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <ShieldCheckIcon
                  className="text-muted-foreground size-4"
                  aria-hidden="true"
                />
                Baseline Scope
              </h3>
              <p className="text-muted-foreground text-sm">
                The agreed scope. New requests are compared against this set.
              </p>
            </div>
            <Card>
              <CardContent className="p-0">
                <RequirementsTable
                  requirements={baselineRequirements}
                  canManage={canManage}
                  laneAction={
                    canManage
                      ? {
                          label: "Move to New Requests",
                          icon: <ArrowDownIcon />,
                          pendingId: movingId,
                          onSelect: (requirement) =>
                            moveLane.mutate({
                              requirementId: requirement.id,
                              isBaseline: false,
                            }),
                        }
                      : undefined
                  }
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              </CardContent>
            </Card>
          </section>

          <section className="flex flex-col gap-2">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <InboxIcon
                  className="text-muted-foreground size-4"
                  aria-hidden="true"
                />
                New / Change Requests
              </h3>
              <p className="text-muted-foreground text-sm">
                Requirements not yet in the baseline. Run “Compare to baseline”
                below to check them for scope creep.
              </p>
            </div>
            {requestRequirements.length === 0 ? (
              <EmptyState
                icon={<InboxIcon className="size-5" />}
                title="No new requests"
                description={
                  canManage
                    ? "Add a request or extract from a new document. New items land here to be compared against the baseline."
                    : "New or changed requirements will appear here."
                }
                action={
                  canManage ? (
                    <Button
                      variant="outline"
                      onClick={() => setAddRequestOpen(true)}
                    >
                      <FilePlusIcon aria-hidden="true" />
                      Add new request
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <RequirementsTable
                    requirements={requestRequirements}
                    canManage={canManage}
                    laneAction={
                      canManage
                        ? {
                            label: "Add to baseline",
                            icon: <ArrowUpIcon />,
                            pendingId: movingId,
                            onSelect: (requirement) =>
                              moveLane.mutate({
                                requirementId: requirement.id,
                                isBaseline: true,
                              }),
                          }
                        : undefined
                    }
                    onEdit={setEditing}
                    onDelete={setDeleting}
                  />
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      )}

      {!isLoading && !isError && hasRequirements && (
        <>
          <Separator className="my-2" />
          <ScopeFlagsDashboard
            projectId={projectId}
            canManage={canManage}
            baselineCount={baselineRequirements.length}
            candidateCount={requestRequirements.length}
          />
        </>
      )}

      {canManage && (
        <>
          <ExtractRequirementsDialog
            open={extractOpen}
            onOpenChange={setExtractOpen}
            projectId={projectId}
          />
          <AddRequestDialog
            open={addRequestOpen}
            onOpenChange={setAddRequestOpen}
            projectId={projectId}
          />
          <EditRequirementDialog
            open={editing !== null}
            onOpenChange={(open) => !open && setEditing(null)}
            projectId={projectId}
            requirement={editing}
          />
          <DeleteRequirementDialog
            open={deleting !== null}
            onOpenChange={(open) => !open && setDeleting(null)}
            projectId={projectId}
            requirement={deleting}
          />
        </>
      )}
    </div>
  );
}
