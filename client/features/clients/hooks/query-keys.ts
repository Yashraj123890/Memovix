/** Query key factory for the clients feature — same convention as teamKeys/fileKeys/timelineKeys. */
export const clientKeys = {
  all: ["clients"] as const,
  activeClients: (projectId: string) => [...clientKeys.all, "project", projectId, "active"] as const,
  invitations: (projectId: string) => [...clientKeys.all, "project", projectId, "invitations"] as const,
};
