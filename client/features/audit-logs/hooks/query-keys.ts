/** Query key factory for audit logs — same convention as memoryKeys/fileKeys/teamKeys. */
export const auditLogKeys = {
  all: ["audit-logs"] as const,
  project: (projectId: string) => [...auditLogKeys.all, "project", projectId] as const,
};
