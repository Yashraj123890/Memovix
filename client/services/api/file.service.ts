import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { FileDownloadInfo, ProjectFile } from "@/types/file";

const FILE_ENDPOINTS = {
  upload: "/files/upload",
  listByProject: (projectId: string) => `/files/project/${projectId}`,
  downloadUrl: (fileId: string) => `/files/${fileId}/download`,
  file: (fileId: string) => `/files/${fileId}`,
  reindex: (fileId: string) => `/files/${fileId}/reindex`,
} as const;

/**
 * getDownloadUrl added in F12 for inline image preview on the File Detail
 * page. uploadFile/deleteFile added here to wire up POST /files/upload and
 * DELETE /files/:fileId (server/src/routes/project-file.routes.ts) — both
 * always existed on the backend but had no frontend caller until now.
 *
 * uploadFile explicitly overrides Content-Type away from the apiClient
 * default of "application/json": axios's transformRequest checks
 * `getContentType().includes("application/json")` *before* the browser
 * ever sees the request, and if that's true it JSON.stringifies the
 * FormData instead of sending it as multipart — silently breaking the
 * upload. Setting it to "multipart/form-data" here avoids that; axios then
 * strips the header entirely in the browser adapter so the browser can set
 * the real value with the multipart boundary itself.
 *
 * Note there is no plain metadata GET /files/:fileId endpoint; single-file
 * lookups are derived client-side from the list query (see
 * features/files/hooks/use-file-detail.ts).
 */
export const fileService = {
  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    const response = await apiClient.get<ApiSuccessResponse<ProjectFile[]>>(
      FILE_ENDPOINTS.listByProject(projectId),
    );
    return response.data.data;
  },

  async uploadFile(projectId: string, file: File): Promise<ProjectFile> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);

    const response = await apiClient.post<ApiSuccessResponse<ProjectFile>>(
      FILE_ENDPOINTS.upload,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
  },

  async getDownloadUrl(fileId: string): Promise<FileDownloadInfo> {
    const response = await apiClient.get<ApiSuccessResponse<FileDownloadInfo>>(
      FILE_ENDPOINTS.downloadUrl(fileId),
    );
    return response.data.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(FILE_ENDPOINTS.file(fileId));
  },

  async reindex(fileId: string): Promise<ProjectFile> {
    const response = await apiClient.post<ApiSuccessResponse<{ file: ProjectFile }>>(
      FILE_ENDPOINTS.reindex(fileId),
    );
    return response.data.data.file;
  },
};
