import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { Memory, MemoryCategory } from "@/types/memory";

const MEMORY_ENDPOINTS = {
  base: "/memories",
  listByProject: (projectId: string) => `/memories/project/${projectId}`,
  search: "/memories/search/query",
  byId: (memoryId: string) => `/memories/${memoryId}`,
} as const;

export interface CreateMemoryRequest {
  title: string;
  content: string;
  category: MemoryCategory;
  customCategory?: string | null;
  projectId: string;
}

export interface UpdateMemoryRequest {
  title?: string;
  content?: string;
  category?: MemoryCategory;
  customCategory?: string | null;
}

/**
 * Memory API service. Two list-style read endpoints exist on the backend
 * (server/src/routes/memory.routes.ts) — a plain per-project list and a
 * separate title/content search — rather than one endpoint with query
 * params. See features/memories/hooks/use-memories-query.ts for how the
 * frontend picks between them.
 *
 * getMemoryById added once GET /memories/:memoryId's controller bug was
 * fixed server-side (it previously delegated to updateMemory, writing a
 * spurious timeline/audit event on every view — see the now-resolved
 * memory-detail-endpoint-bug note). Memory Detail now calls this directly
 * instead of deriving from the list query.
 *
 * createMemory/updateMemory/deleteMemory added here: POST /memories,
 * PUT /memories/:memoryId and DELETE /memories/:memoryId always existed on
 * the backend (createdById/tenantId are injected server-side from the
 * auth token, not sent by the client) but had no frontend caller until now
 * — same situation Files' upload/delete were in before that phase.
 */
export const memoryService = {
  async getProjectMemories(projectId: string): Promise<Memory[]> {
    const response = await apiClient.get<ApiSuccessResponse<Memory[]>>(
      MEMORY_ENDPOINTS.listByProject(projectId),
    );
    return response.data.data;
  },

  async searchMemories(projectId: string, query: string): Promise<Memory[]> {
    const response = await apiClient.get<ApiSuccessResponse<Memory[]>>(
      MEMORY_ENDPOINTS.search,
      { params: { projectId, query } },
    );
    return response.data.data;
  },

  async getMemoryById(memoryId: string): Promise<Memory> {
    const response = await apiClient.get<ApiSuccessResponse<Memory>>(
      MEMORY_ENDPOINTS.byId(memoryId),
    );
    return response.data.data;
  },

  async createMemory(payload: CreateMemoryRequest): Promise<Memory> {
    const response = await apiClient.post<ApiSuccessResponse<Memory>>(
      MEMORY_ENDPOINTS.base,
      payload,
    );
    return response.data.data;
  },

  async updateMemory(memoryId: string, payload: UpdateMemoryRequest): Promise<Memory> {
    const response = await apiClient.put<ApiSuccessResponse<Memory>>(
      MEMORY_ENDPOINTS.byId(memoryId),
      payload,
    );
    return response.data.data;
  },

  async deleteMemory(memoryId: string): Promise<void> {
    await apiClient.delete(MEMORY_ENDPOINTS.byId(memoryId));
  },
};
