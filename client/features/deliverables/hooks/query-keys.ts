/** Query key factory for the deliverables feature — same convention as fileKeys/memoryKeys. */
export const deliverableKeys = {
  all: ["deliverables"] as const,
  list: (projectId: string) => [...deliverableKeys.all, "project", projectId, "list"] as const,
  detail: (deliverableId: string) => [...deliverableKeys.all, "detail", deliverableId] as const,
  revisions: (deliverableId: string) =>
    [...deliverableKeys.all, "revisions", deliverableId] as const,
};
