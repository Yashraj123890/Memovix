import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from "@/types/project";

const PROJECT_ENDPOINTS = {
  list: "/projects",
  detail: (id: string) => `/projects/${id}`,
} as const;

/**
 * Project API service (docs/coding-standards.md "API Layer" — never call
 * axios directly from components/hooks).
 *
 * update/remove call the existing PUT /projects/:id and DELETE /projects/:id
 * (server/src/routes/project.routes.ts) — no new endpoints. The lifecycle
 * transitions (Mark as completed / Archive / Restore) go through `update` with
 * just `{ status }`. These endpoints return `{ success, message }` with no
 * `data`, so both methods resolve to void; callers refetch via query invalidation.
 */
export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<ApiSuccessResponse<Project[]>>(
      PROJECT_ENDPOINTS.list,
    );
    return response.data.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await apiClient.get<ApiSuccessResponse<Project>>(
      PROJECT_ENDPOINTS.detail(id),
    );
    return response.data.data;
  },

  async createProject(payload: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<ApiSuccessResponse<Project>>(
      PROJECT_ENDPOINTS.list,
      payload,
    );
    return response.data.data;
  },

  async updateProject(
    id: string,
    payload: UpdateProjectRequest,
  ): Promise<void> {
    await apiClient.put(PROJECT_ENDPOINTS.detail(id), payload);
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(PROJECT_ENDPOINTS.detail(id));
  },
};
