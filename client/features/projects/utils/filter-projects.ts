import type { Project, ProjectStatus } from "@/types/project";

export interface ProjectFilters {
  search: string;
  status: ProjectStatus | "ALL";
}

/**
 * Client-side search + status filtering. GET /projects
 * (server/src/controllers/project.controller.ts) returns the tenant's
 * entire project list with no query-param support, so filtering has to
 * happen here rather than being sent as request params. Pure function, not
 * a hook — no side effects, easy to unit test.
 */
export function filterProjects(
  projects: Project[],
  { search, status }: ProjectFilters,
): Project[] {
  const normalizedSearch = search.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesStatus = status === "ALL" || project.status === status;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      project.name.toLowerCase().includes(normalizedSearch);
    return matchesStatus && matchesSearch;
  });
}
