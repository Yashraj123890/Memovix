/**
 * This feature manages workspace members only. GET /api/members/workspace
 * (server/src/repositories/member.repository.ts getWorkspaceMembers) is
 * filtered to role IN [OWNER, MEMBER], and addMember
 * (server/src/controllers/projectMember.controller.ts) always assigns
 * MEMBER — CLIENT never appears through these endpoints. Using this
 * narrower type instead of the app-wide UserRole keeps CLIENT out of the
 * Team feature's badges/filters/config at the type level rather than by
 * convention; if the backend later exposes clients for this feature, this
 * is the type to widen.
 */
export type TeamRole = "OWNER" | "MEMBER";

/** Returned by GET /api/members/workspace — OWNER/MEMBER users in the current tenant. */
export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  createdAt: string;
}

/**
 * Returned by GET/POST /api/projects/:projectId/members
 * (server/src/repositories/projectMemberRepository.ts). Unlike the F6/F8/F9
 * author gaps, this endpoint already joins `user` — no optional/fallback
 * handling needed here.
 */
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: TeamRole;
  };
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

/**
 * Returned by GET /api/members (server/src/repositories/member.repository.ts
 * getTenantInvitations) — a *workspace* invitation, scoped to the tenant,
 * not to any one project (MemberInvitation has no projectId column in
 * server/prisma/schema.prisma). Accepting one only creates a workspace
 * User; it does not add that user to a project's roster — that's a
 * separate step via addProjectMember. See team-container.tsx for how the
 * Team page presents both without conflating them.
 */
export interface MemberInvitation {
  id: string;
  email: string;
  status: InvitationStatus;
  tenantId: string;
  invitedById: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
