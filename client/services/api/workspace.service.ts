import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type { AuthUser } from "@/types/auth";
import type { Workspace } from "@/types/workspace";

const WORKSPACE_ENDPOINTS = {
  list: "/auth/workspaces",
  switch: "/auth/switch-workspace",
} as const;

export interface SwitchWorkspaceResult {
  accessToken: string;
  user: AuthUser;
}

/**
 * The ONE place the frontend talks to the workspace backend (M11). Keeping all
 * workspace I/O here means the server can change how it derives the workspace
 * list (the temporary invitation-based source → an authoritative one) without
 * any change to hooks, components, or routing above this file.
 */
export const workspaceService = {
  /**
   * Accessible workspaces for the signed-in user ({ tenantId, name, role }).
   * `accessToken` lets the caller resolve workspaces during login BEFORE the
   * token is committed to the store (the request interceptor only attaches a
   * token when the store already has one) — used to decide the post-login
   * destination without first marking the session authenticated.
   */
  async list(accessToken?: string): Promise<Workspace[]> {
    const response = await apiClient.get<ApiSuccessResponse<Workspace[]>>(
      WORKSPACE_ENDPOINTS.list,
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    );
    return response.data.data;
  },

  /** Switch the active workspace (clients only) — returns a new access token. */
  async switch(tenantId: string): Promise<SwitchWorkspaceResult> {
    const response = await apiClient.post<
      ApiSuccessResponse<SwitchWorkspaceResult>
    >(WORKSPACE_ENDPOINTS.switch, { tenantId });
    return response.data.data;
  },
};
