import type { TeamRole } from "@/types/team";

/**
 * This feature manages workspace members only (OWNER/MEMBER) — see the
 * TeamRole doc comment in types/team.ts. No CLIENT entry here; add one
 * only once the backend exposes clients for this feature.
 */
export const ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: "Owner",
  MEMBER: "Member",
};

/** Owner is the more prominent badge — matches each role's relative access level. */
export const ROLE_BADGE_VARIANT: Record<TeamRole, "default" | "secondary"> = {
  OWNER: "default",
  MEMBER: "secondary",
};

export interface RoleFilterOption {
  value: TeamRole | "ALL";
  label: string;
}

export const ROLE_FILTER_OPTIONS: RoleFilterOption[] = [
  { value: "ALL", label: "All roles" },
  { value: "OWNER", label: ROLE_LABEL.OWNER },
  { value: "MEMBER", label: ROLE_LABEL.MEMBER },
];
