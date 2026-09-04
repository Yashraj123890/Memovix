import type { UserRole } from "@/constants/roles";

/**
 * A workspace the current user can access (M11 client-only multi-workspace).
 * Backed by GET /auth/workspaces. The frontend depends ONLY on this shape,
 * never on how the backend derives the list — so the server-side source can be
 * swapped later without touching any UI.
 */
export interface Workspace {
  tenantId: string;
  name: string;
  role: UserRole;
}
