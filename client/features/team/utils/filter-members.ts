import type { ProjectMember, TeamRole } from "@/types/team";

export interface MemberFilters {
  search: string;
  role: TeamRole | "ALL";
}

/**
 * Client-side search + role filtering. GET /projects/:id/members takes no
 * query params, so both happen here — same situation as F5 Projects/F9
 * Files.
 */
export function filterMembers(members: ProjectMember[], { search, role }: MemberFilters): ProjectMember[] {
  const normalizedSearch = search.trim().toLowerCase();

  return members.filter((member) => {
    const matchesRole = role === "ALL" || member.role === role;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      member.user.name.toLowerCase().includes(normalizedSearch) ||
      member.user.email.toLowerCase().includes(normalizedSearch);
    return matchesRole && matchesSearch;
  });
}
