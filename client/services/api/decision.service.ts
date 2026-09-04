import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { Decision, DecisionCategory } from "@/types/decision";

const DECISION_ENDPOINTS = {
  listByProject: (projectId: string) => `/projects/${projectId}/decisions`,
  create: (projectId: string) => `/projects/${projectId}/decisions`,
} as const;

export interface CreateDecisionPayload {
  category: DecisionCategory;
  customCategory?: string | null;
  description: string;
}

/** Decision Log API client — same shape as deliverableService / fileService. */
export const decisionService = {
  async list(projectId: string, category?: DecisionCategory): Promise<Decision[]> {
    const response = await apiClient.get<ApiSuccessResponse<Decision[]>>(
      DECISION_ENDPOINTS.listByProject(projectId),
      { params: category ? { category } : undefined },
    );
    return response.data.data;
  },

  async create(projectId: string, payload: CreateDecisionPayload): Promise<Decision> {
    const response = await apiClient.post<ApiSuccessResponse<Decision>>(
      DECISION_ENDPOINTS.create(projectId),
      payload,
    );
    return response.data.data;
  },
};
