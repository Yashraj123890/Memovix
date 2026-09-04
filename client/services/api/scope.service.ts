import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  CompareBaselineResult,
  ResolveScopeFlagResult,
  ScopeFlag,
  ScopeResolveAction,
} from "@/types/scope-flag";

const SCOPE_ENDPOINTS = {
  compareBaseline: (projectId: string) =>
    `/projects/${projectId}/requirements/compare-baseline`,
  listFlags: (projectId: string) => `/projects/${projectId}/scope-flags`,
  resolve: (projectId: string, flagId: string) =>
    `/projects/${projectId}/scope-flags/${flagId}/resolve`,
} as const;

/**
 * Scope Creep Detection API client (blueprint §3.2.5 / §3.2.6). Runs the
 * comparison pipeline, lists flags, and actions them. Same service shape as
 * requirementService / decisionService.
 */
export const scopeService = {
  /** Compare non-baseline requirements against the baseline set → flags. */
  async compareBaseline(projectId: string): Promise<CompareBaselineResult> {
    const response = await apiClient.post<
      ApiSuccessResponse<CompareBaselineResult>
    >(SCOPE_ENDPOINTS.compareBaseline(projectId));
    return response.data.data;
  },

  async listFlags(
    projectId: string,
    resolution?: string,
  ): Promise<ScopeFlag[]> {
    const response = await apiClient.get<ApiSuccessResponse<ScopeFlag[]>>(
      SCOPE_ENDPOINTS.listFlags(projectId),
      { params: resolution ? { resolution } : undefined },
    );
    return response.data.data;
  },

  async resolve(
    projectId: string,
    flagId: string,
    action: ScopeResolveAction,
  ): Promise<ResolveScopeFlagResult> {
    const response = await apiClient.post<
      ApiSuccessResponse<ResolveScopeFlagResult>
    >(SCOPE_ENDPOINTS.resolve(projectId, flagId), { action });
    return response.data.data;
  },
};
