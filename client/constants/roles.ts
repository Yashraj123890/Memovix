/**
 * User roles as defined by the backend (see docs/api-notes.md "User Roles").
 *
 * OWNER — full workspace access.
 * MEMBER — access to assigned projects.
 * CLIENT — read/collaborate access to shared project content.
 *
 * This is shared vocabulary for role-aware UI and route access checks in
 * later phases. The backend remains the source of truth for authorization —
 * these constants are not an enforcement mechanism.
 */
export const USER_ROLES = {
  OWNER: "OWNER",
  MEMBER: "MEMBER",
  CLIENT: "CLIENT",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
