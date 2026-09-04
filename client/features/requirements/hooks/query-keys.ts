/** Query key factory for the requirements feature — same convention as decisionKeys. */
export const requirementKeys = {
  all: ["requirements"] as const,
  projectAll: (projectId: string) =>
    [...requirementKeys.all, "project", projectId] as const,
  list: (projectId: string, baseline?: boolean) =>
    [
      ...requirementKeys.projectAll(projectId),
      baseline === undefined ? "ALL" : baseline,
    ] as const,
};
