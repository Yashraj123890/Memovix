import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  Deliverable,
  DeliverableDetail,
  DeliverableListItem,
  DeliverableVersion,
  RevisionRequest,
  VersionDownloadInfo,
} from "@/types/deliverable";

const DELIVERABLE_ENDPOINTS = {
  listByProject: (projectId: string) => `/projects/${projectId}/deliverables`,
  create: (projectId: string) => `/projects/${projectId}/deliverables`,
  detail: (id: string) => `/deliverables/${id}`,
  versions: (id: string) => `/deliverables/${id}/versions`,
  versionDownload: (id: string, versionId: string) =>
    `/deliverables/${id}/versions/${versionId}/download`,
  approve: (id: string) => `/deliverables/${id}/approve`,
  requestRevision: (id: string) => `/deliverables/${id}/request-revision`,
  revisionRequests: (id: string) => `/deliverables/${id}/revision-requests`,
} as const;

export interface CreateDeliverablePayload {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateDeliverablePayload {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  status?: "DRAFT" | "SUBMITTED";
}

/**
 * Deliverables API client — same shape as fileService. The version upload
 * overrides Content-Type to multipart for the same reason documented in
 * file.service.ts (axios would otherwise JSON.stringify the FormData).
 */
export const deliverableService = {
  async list(projectId: string): Promise<DeliverableListItem[]> {
    const response = await apiClient.get<ApiSuccessResponse<DeliverableListItem[]>>(
      DELIVERABLE_ENDPOINTS.listByProject(projectId),
    );
    return response.data.data;
  },

  async get(deliverableId: string): Promise<DeliverableDetail> {
    const response = await apiClient.get<ApiSuccessResponse<DeliverableDetail>>(
      DELIVERABLE_ENDPOINTS.detail(deliverableId),
    );
    return response.data.data;
  },

  async create(projectId: string, payload: CreateDeliverablePayload): Promise<Deliverable> {
    const response = await apiClient.post<ApiSuccessResponse<Deliverable>>(
      DELIVERABLE_ENDPOINTS.create(projectId),
      payload,
    );
    return response.data.data;
  },

  async update(deliverableId: string, payload: UpdateDeliverablePayload): Promise<Deliverable> {
    const response = await apiClient.patch<ApiSuccessResponse<Deliverable>>(
      DELIVERABLE_ENDPOINTS.detail(deliverableId),
      payload,
    );
    return response.data.data;
  },

  async remove(deliverableId: string): Promise<void> {
    await apiClient.delete(DELIVERABLE_ENDPOINTS.detail(deliverableId));
  },

  async uploadVersion(
    deliverableId: string,
    file: File,
    changeSummary?: string,
  ): Promise<DeliverableVersion> {
    const formData = new FormData();
    formData.append("file", file);
    if (changeSummary && changeSummary.trim().length > 0) {
      formData.append("changeSummary", changeSummary.trim());
    }

    const response = await apiClient.post<ApiSuccessResponse<DeliverableVersion>>(
      DELIVERABLE_ENDPOINTS.versions(deliverableId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
  },

  /**
   * `download: true` asks the backend for an attachment-disposition signed URL
   * (forces a real download with the correct filename); omit it for an inline
   * URL suitable for Preview (opening PDFs/images in a new tab).
   */
  async getVersionDownloadUrl(
    deliverableId: string,
    versionId: string,
    options?: { download?: boolean },
  ): Promise<VersionDownloadInfo> {
    const response = await apiClient.get<ApiSuccessResponse<VersionDownloadInfo>>(
      DELIVERABLE_ENDPOINTS.versionDownload(deliverableId, versionId),
      options?.download ? { params: { disposition: "attachment" } } : undefined,
    );
    return response.data.data;
  },

  async approve(deliverableId: string): Promise<Deliverable> {
    const response = await apiClient.post<ApiSuccessResponse<Deliverable>>(
      DELIVERABLE_ENDPOINTS.approve(deliverableId),
    );
    return response.data.data;
  },

  async requestRevision(
    deliverableId: string,
    comment: string,
  ): Promise<{ deliverable: Deliverable; revision: RevisionRequest }> {
    const response = await apiClient.post<
      ApiSuccessResponse<{ deliverable: Deliverable; revision: RevisionRequest }>
    >(DELIVERABLE_ENDPOINTS.requestRevision(deliverableId), { comment });
    return response.data.data;
  },

  async listRevisionRequests(deliverableId: string): Promise<RevisionRequest[]> {
    const response = await apiClient.get<ApiSuccessResponse<RevisionRequest[]>>(
      DELIVERABLE_ENDPOINTS.revisionRequests(deliverableId),
    );
    return response.data.data;
  },
};
