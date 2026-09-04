import type { TeamRole, WorkspaceMember } from "@/types/team";

export interface WorkspaceMemberFilters {
  search: string;
  role: TeamRole | "ALL";
}

/**
 * Same client-side search + role filtering as filter-members.ts, but for
 * the flat WorkspaceMember shape (GET /members/workspace has no nested
 * `user` object like ProjectMember does) — kept as a separate util rather
 * than overloading filterMembers so neither has to branch on shape.
 */
export function filterWorkspaceMembers(
  members: WorkspaceMember[],
  { search, role }: WorkspaceMemberFilters,
): WorkspaceMember[] {
  const normalizedSearch = search.trim().toLowerCase();

  return members.filter((member) => {
    const matchesRole = role === "ALL" || member.role === role;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      member.name.toLowerCase().includes(normalizedSearch) ||
      member.email.toLowerCase().includes(normalizedSearch);
    return matchesRole && matchesSearch;
  });
}
