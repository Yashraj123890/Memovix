import type { CommentSubjectType } from "@/types/comment";

/** Query key factory for the comments feature — same convention as projectKeys/timelineKeys/memoryKeys/fileKeys/teamKeys. */
export const commentKeys = {
  all: ["comments"] as const,
  forSubject: (subjectType: CommentSubjectType, subjectId: string) =>
    [...commentKeys.all, subjectType, subjectId] as const,
};
