import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { TimelineEvent } from "@/types/timeline";

const TIMELINE_ENDPOINTS = {
  list: (projectId: string) => `/projects/${projectId}/timeline`,
} as const;

/**
 * Timeline API service (docs/coding-standards.md "API Layer"). Read-only —
 * events are created as a side effect of other actions (memory/file/
 * comment mutations) on the backend, never directly from the frontend.
 */
export const timelineService = {
  async getProjectTimeline(projectId: string): Promise<TimelineEvent[]> {
    const response = await apiClient.get<ApiSuccessResponse<TimelineEvent[]>>(
      TIMELINE_ENDPOINTS.list(projectId),
    );
    return response.data.data;
  },
};
