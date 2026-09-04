import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { ClientInvitation, ProjectClient } from "@/types/client";

const CLIENT_ENDPOINTS = {
  inviteClient: (projectId: string) => `/projects/${projectId}/invite-client`,
  projectClients: (projectId: string) => `/projects/${projectId}/clients`,
  projectClient: (projectId: string, clientId: string) => `/projects/${projectId}/clients/${clientId}`,
  clientInvitations: (projectId: string) => `/projects/${projectId}/client-invitations`,
  clientInvitation: (projectId: string, invitationId: string) =>
    `/projects/${projectId}/client-invitations/${invitationId}`,
} as const;

/**
 * Client management API service — all five endpoints are real and
 * project-scoped (server/src/routes/clientInvitation.routes.ts and
 * projectClient.routes.ts, both mounted at /api in server/src/app.ts).
 * inviteClient requires OWNER server-side (authorize(UserRole.OWNER) on
 * POST /projects/:projectId/invite-client); the other four allow OWNER or
 * MEMBER (authorize(UserRole.OWNER, UserRole.MEMBER)) — see
 * clients-container.tsx for how the frontend mirrors that split.
 */
export const clientService = {
  async inviteClient(projectId: string, email: string): Promise<ClientInvitation> {
    const response = await apiClient.post<ApiSuccessResponse<ClientInvitation>>(
      CLIENT_ENDPOINTS.inviteClient(projectId),
      { email },
    );
    return response.data.data;
  },

  async getProjectClients(projectId: string): Promise<ProjectClient[]> {
    const response = await apiClient.get<ApiSuccessResponse<ProjectClient[]>>(
      CLIENT_ENDPOINTS.projectClients(projectId),
    );
    return response.data.data;
  },

  async removeProjectClient(projectId: string, clientId: string): Promise<void> {
    await apiClient.delete(CLIENT_ENDPOINTS.projectClient(projectId, clientId));
  },

  async getClientInvitations(projectId: string): Promise<ClientInvitation[]> {
    const response = await apiClient.get<ApiSuccessResponse<ClientInvitation[]>>(
      CLIENT_ENDPOINTS.clientInvitations(projectId),
    );
    return response.data.data;
  },

  async cancelClientInvitation(projectId: string, invitationId: string): Promise<void> {
    await apiClient.delete(CLIENT_ENDPOINTS.clientInvitation(projectId, invitationId));
  },
};
