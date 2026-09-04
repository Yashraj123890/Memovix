"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "@/services/api/audit-log.service";
import { auditLogKeys } from "@/features/audit-logs/hooks/query-keys";

export function useAuditLogsQuery(projectId: string) {
  return useQuery({
    queryKey: auditLogKeys.project(projectId),
    queryFn: () => auditLogService.getProjectLogs(projectId),
  });
}
