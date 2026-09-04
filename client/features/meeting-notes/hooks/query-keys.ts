/** Query key factory for the meeting-notes feature — same convention as decisionKeys. */
export const meetingNoteKeys = {
  all: ["meeting-notes"] as const,
  projectAll: (projectId: string) =>
    [...meetingNoteKeys.all, "project", projectId] as const,
  list: (projectId: string) =>
    [...meetingNoteKeys.projectAll(projectId), "list"] as const,
  detail: (projectId: string, meetingNoteId: string) =>
    [
      ...meetingNoteKeys.projectAll(projectId),
      "detail",
      meetingNoteId,
    ] as const,
};
