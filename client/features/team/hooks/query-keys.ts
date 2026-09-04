/** Query key factory for the team feature — same convention as projectKeys/timelineKeys/memoryKeys/fileKeys. */
export const teamKeys = {
  all: ["team"] as const,
  workspaceMembers: () => [...teamKeys.all, "workspace"] as const,
  projectMembers: (projectId: string) => [...teamKeys.all, "project", projectId, "members"] as const,
  invitations: () => [...teamKeys.all, "invitations"] as const,
};
