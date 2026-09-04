import { apiClient } from "./client";
import { AI_REQUEST_TIMEOUT_MS } from "@/constants/api";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ConfirmRequirementInput,
  ConfirmRequirementsResult,
  ExtractRequirementsResult,
  Requirement,
  UpdateRequirementInput,
} from "@/types/requirement";

const REQUIREMENT_ENDPOINTS = {
  extract: "/ai/requirements/extract",
  listByProject: (projectId: string) => `/projects/${projectId}/requirements`,
  create: (projectId: string) => `/projects/${projectId}/requirements`,
  reject: (projectId: string) => `/projects/${projectId}/requirements/reject`,
  baseline: (projectId: string) =>
    `/projects/${projectId}/requirements/baseline`,
  byId: (projectId: string, requirementId: string) =>
    `/projects/${projectId}/requirements/${requirementId}`,
} as const;

/**
 * Structured Requirements API client (blueprint §3.2.4). Extraction only
 * PROPOSES (ephemeral); requirements are persisted solely via `confirm`.
 * Same service shape as decisionService / deliverableService.
 */
export const requirementService = {
  /** AI proposes requirements from a source file (or project memory) — no persistence. */
  async extract(
    projectId: string,
    sourceFileId?: string,
  ): Promise<ExtractRequirementsResult> {
    const response = await apiClient.post<
      ApiSuccessResponse<ExtractRequirementsResult>
    >(
      REQUIREMENT_ENDPOINTS.extract,
      {
        projectId,
        ...(sourceFileId ? { sourceFileId } : {}),
      },
      // Extraction runs a full LLM generation inline; wait up to the backend's
      // AI ceiling rather than aborting at the default 15s.
      { timeout: AI_REQUEST_TIMEOUT_MS },
    );
    return response.data.data;
  },

  async list(projectId: string, baseline?: boolean): Promise<Requirement[]> {
    const response = await apiClient.get<ApiSuccessResponse<Requirement[]>>(
      REQUIREMENT_ENDPOINTS.listByProject(projectId),
      { params: baseline === undefined ? undefined : { baseline } },
    );
    return response.data.data;
  },

  /** Persist reviewed requirements (Accept / Edit & Save). */
  async confirm(
    projectId: string,
    requirements: ConfirmRequirementInput[],
  ): Promise<ConfirmRequirementsResult> {
    const response = await apiClient.post<
      ApiSuccessResponse<ConfirmRequirementsResult>
    >(REQUIREMENT_ENDPOINTS.create(projectId), { requirements });
    return response.data.data;
  },

  /** Record a rejection of proposed requirements (audit only — persists nothing). */
  async reject(
    projectId: string,
    titles: string[],
  ): Promise<{ rejected: number }> {
    const response = await apiClient.post<
      ApiSuccessResponse<{ rejected: number }>
    >(REQUIREMENT_ENDPOINTS.reject(projectId), {
      requirements: titles.map((title) => ({ title })),
    });
    return response.data.data;
  },

  async update(
    projectId: string,
    requirementId: string,
    payload: UpdateRequirementInput,
  ): Promise<Requirement> {
    const response = await apiClient.patch<ApiSuccessResponse<Requirement>>(
      REQUIREMENT_ENDPOINTS.byId(projectId, requirementId),
      payload,
    );
    return response.data.data;
  },

  async remove(projectId: string, requirementId: string): Promise<void> {
    await apiClient.delete(
      REQUIREMENT_ENDPOINTS.byId(projectId, requirementId),
    );
  },

  /** Redefine the project's Baseline Scope to exactly the given requirement set. */
  async setBaseline(
    projectId: string,
    requirementIds: string[],
  ): Promise<Requirement[]> {
    const response = await apiClient.post<ApiSuccessResponse<Requirement[]>>(
      REQUIREMENT_ENDPOINTS.baseline(projectId),
      { requirementIds },
    );
    return response.data.data;
  },
};
