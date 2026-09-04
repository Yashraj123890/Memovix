/** Query key factory for the files feature — same convention as projectKeys/timelineKeys/memoryKeys. */
export const fileKeys = {
  all: ["files"] as const,
  list: (projectId: string) => [...fileKeys.all, "project", projectId, "list"] as const,
  downloadUrl: (fileId: string) => [...fileKeys.all, fileId, "download-url"] as const,
};
