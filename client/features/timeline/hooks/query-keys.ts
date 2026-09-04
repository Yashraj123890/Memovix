/**
 * Query key factory for the timeline feature — same convention as
 * features/projects/hooks/query-keys.ts. Scoped by projectId since a
 * timeline only ever exists in the context of one project.
 *
 * Live updates are out of scope for F7, but this key is exactly what a
 * future polling/WebSocket layer would target with
 * queryClient.setQueryData(timelineKeys.list(projectId), ...) or
 * invalidateQueries — no rework needed here when that lands.
 */
export const timelineKeys = {
  all: ["timeline"] as const,
  list: (projectId: string) => [...timelineKeys.all, "project", projectId] as const,
};
