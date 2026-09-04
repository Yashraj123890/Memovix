"use client";

import { useState } from "react";
import { ScrollTextIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FadeIn } from "@/components/motion/fade-in";
import { AuditLogTable } from "@/features/audit-logs/components/audit-log-table";
import { AuditLogDetailDrawer } from "@/features/audit-logs/components/audit-log-detail-drawer";
import { AuditLogsSkeleton } from "@/features/audit-logs/components/audit-logs-skeleton";
import { useAuditLogsQuery } from "@/features/audit-logs/hooks/use-audit-logs-query";
import { getErrorMessage } from "@/utils/error";
import type { AuditLog } from "@/types/audit-log";

interface AuditLogsContainerProps {
  projectId: string;
}

const PAGE_SIZE = 15;

/**
 * The only place in this feature that calls useAuditLogsQuery and owns
 * pagination/selected-log state — same shape as every other workspace
 * tab container. Pagination is entirely client-side (page/slice over the
 * already-fetched array) since GET /audit/project/:projectId has no
 * server-side take/skip — see services/api/audit-log.service.ts.
 */
export function AuditLogsContainer({ projectId }: AuditLogsContainerProps) {
  const { data: logs, isLoading, isError, error, refetch } = useAuditLogsQuery(projectId);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const totalPages = logs ? Math.max(1, Math.ceil(logs.length / PAGE_SIZE)) : 1;
  const paginatedLogs = logs?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  return (
    <FadeIn className="flex flex-col gap-4">
      {isLoading ? (
        <AuditLogsSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !logs || logs.length === 0 ? (
        <EmptyState
          icon={<ScrollTextIcon className="size-5" />}
          title="No audit activity yet"
          description="Actions taken across this project — memories, files, comments and invitations — will be recorded here."
        />
      ) : (
        <FadeIn>
          <Card>
            <CardContent className="p-0">
              <AuditLogTable logs={paginatedLogs} onSelect={setSelectedLog} />
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                Page {page} of {totalPages} · {logs.length} events
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </FadeIn>
      )}

      <AuditLogDetailDrawer log={selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)} />
    </FadeIn>
  );
}
