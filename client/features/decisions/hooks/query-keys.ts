/** Query key factory for the decisions feature — same convention as deliverableKeys. */
export const decisionKeys = {
  all: ["decisions"] as const,
  projectAll: (projectId: string) => [...decisionKeys.all, "project", projectId] as const,
  list: (projectId: string, category?: string) =>
    [...decisionKeys.projectAll(projectId), category ?? "ALL"] as const,
};
