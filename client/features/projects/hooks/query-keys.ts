/**
 * Query key factory for the projects feature.
 *
 * F5 architecture decision: rather than writing array literals (["projects"])
 * inline at every call site, every project query/mutation builds its key
 * from this object. With only one request shape today (GET /projects has no
 * search/status/pagination params — see project.service.ts) this looks like
 * extra structure, but it's what lets a future create/edit/delete mutation
 * invalidate the list with a single, consistent call:
 *
 *   queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
 *
 * `detail(id)` is included now even though F5 has no project detail page,
 * so F5.x (Project Details) only adds a hook that uses it — this file
 * doesn't change.
 */
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};
