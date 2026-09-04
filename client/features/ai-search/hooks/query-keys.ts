/** Query key factory for AI Search — same convention as memoryKeys/fileKeys. */
export const aiSearchKeys = {
  all: ["ai-search"] as const,
  search: (projectId: string, query: string) =>
    [...aiSearchKeys.all, "project", projectId, "search", query] as const,
};
