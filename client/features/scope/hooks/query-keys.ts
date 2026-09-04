/** Query key factory for scope flags — same convention as decisionKeys. */
export const scopeFlagKeys = {
  all: ["scope-flags"] as const,
  projectAll: (projectId: string) =>
    [...scopeFlagKeys.all, "project", projectId] as const,
  list: (projectId: string, resolution?: string) =>
    [...scopeFlagKeys.projectAll(projectId), resolution ?? "ALL"] as const,
};
