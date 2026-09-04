import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { MemberInvitation, ProjectMember, WorkspaceMember } from "@/types/team";

const TEAM_ENDPOINTS = {
  workspaceMembers: "/members/workspace",
  projectMembers: (projectId: string) => `/projects/${projectId}/members`,
  projectMember: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}`,
  inviteMember: "/members/invite",
  invitations: "/members",
  invitation: (id: string) => `/members/${id}`,
} as const;

/**
 * Team API service. Workspace membership (who can be added), project
 * membership (who is on this project) and workspace invitations (who's been
 * invited by email but hasn't joined yet) are three separate backend
 * concepts — see server/src/routes/member.routes.ts vs
 * projectMember.routes.ts — kept as distinct methods here rather than one,
 * matching the backend. inviteMember/getInvitations/deleteInvitation all
 * require the OWNER role server-side (authorize("OWNER") in
 * member.routes.ts); the frontend gates the UI the same way but the backend
 * remains the actual enforcement point.
 */
export const teamService = {
  async getWorkspaceMembers(): Promise<WorkspaceMember[]> {
    const response = await apiClient.get<ApiSuccessResponse<WorkspaceMember[]>>(
      TEAM_ENDPOINTS.workspaceMembers,
    );
    return response.data.data;
  },

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await apiClient.get<ApiSuccessResponse<ProjectMember[]>>(
      TEAM_ENDPOINTS.projectMembers(projectId),
    );
    return response.data.data;
  },

  async addProjectMember(projectId: string, userId: string): Promise<ProjectMember> {
    const response = await apiClient.post<ApiSuccessResponse<ProjectMember>>(
      TEAM_ENDPOINTS.projectMembers(projectId),
      { userId },
    );
    return response.data.data;
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await apiClient.delete(TEAM_ENDPOINTS.projectMember(projectId, userId));
  },

  async inviteMember(email: string): Promise<MemberInvitation> {
    const response = await apiClient.post<ApiSuccessResponse<{ invitation: MemberInvitation }>>(
      TEAM_ENDPOINTS.inviteMember,
      { email },
    );
    return response.data.data.invitation;
  },

  async getInvitations(): Promise<MemberInvitation[]> {
    const response = await apiClient.get<ApiSuccessResponse<MemberInvitation[]>>(
      TEAM_ENDPOINTS.invitations,
    );
    return response.data.data;
  },

  async deleteInvitation(id: string): Promise<void> {
    await apiClient.delete(TEAM_ENDPOINTS.invitation(id));
  },
};
