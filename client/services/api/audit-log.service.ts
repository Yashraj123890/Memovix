import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { AuditLog } from "@/types/audit-log";

const AUDIT_LOG_ENDPOINTS = {
  tenant: "/audit/tenant",
  project: (projectId: string) => `/audit/project/${projectId}`,
} as const;

/**
 * server/src/routes/audit.routes.ts exposes both GET /tenant (every audit
 * log across the caller's tenant) and GET /project/:projectId (one
 * project's audit trail) — this feature only consumes the project-scoped
 * one, matching the project-centric workspace tab it's built into (see
 * features/audit-logs/components/audit-logs-container.tsx). getTenantLogs
 * is still exposed here since it's a real, distinct backend endpoint a
 * future cross-project admin view could use without adding a new service
 * method.
 *
 * Neither endpoint supports pagination or filtering server-side — both
 * return the full unbounded history, ordered newest-first.
 */
export const auditLogService = {
  async getProjectLogs(projectId: string): Promise<AuditLog[]> {
    const response = await apiClient.get<ApiSuccessResponse<AuditLog[]>>(
      AUDIT_LOG_ENDPOINTS.project(projectId),
    );
    return response.data.data;
  },

  async getTenantLogs(): Promise<AuditLog[]> {
    const response = await apiClient.get<ApiSuccessResponse<AuditLog[]>>(
      AUDIT_LOG_ENDPOINTS.tenant,
    );
    return response.data.data;
  },
};
