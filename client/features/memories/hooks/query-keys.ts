/**
 * Query key factory for the memories feature — same convention as
 * projectKeys/timelineKeys. `search` is parameterized by the query string
 * itself, so retyping a previous search term is served from cache; unused
 * entries fall out via TanStack Query's normal gcTime, so this doesn't
 * grow unbounded in practice.
 */
export const memoryKeys = {
  all: ["memories"] as const,
  /**
   * Shared prefix for every query scoped to one project (list + every
   * distinct search string) — invalidating this exact array invalidates
   * both, since TanStack Query's invalidateQueries does prefix matching.
   * Used by the create/update/delete mutations (see
   * use-create-memory-mutation.ts and friends) so a write refreshes
   * whichever of list/search the Memories page happens to be showing.
   */
  project: (projectId: string) => [...memoryKeys.all, "project", projectId] as const,
  list: (projectId: string) => [...memoryKeys.project(projectId), "list"] as const,
  search: (projectId: string, query: string) =>
    [...memoryKeys.project(projectId), "search", query] as const,
  detail: (memoryId: string) => [...memoryKeys.all, "detail", memoryId] as const,
};
