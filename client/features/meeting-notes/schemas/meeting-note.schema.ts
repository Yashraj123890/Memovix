import { z } from "zod";

/**
 * Mirrors the backend meeting-note validators
 * (server/src/validators/meetingNote.validator.ts).
 */
export const meetingNoteRawSchema = z.object({
  rawText: z
    .string()
    .trim()
    .min(1, "Paste the meeting notes to summarize")
    .max(50000),
});

export const meetingNoteSaveSchema = z.object({
  rawText: z.string().trim().min(1, "Meeting notes are required").max(50000),
  summary: z.string().trim().min(1, "Summary is required").max(20000),
});

export type MeetingNoteRawValues = z.infer<typeof meetingNoteRawSchema>;
export type MeetingNoteSaveValues = z.infer<typeof meetingNoteSaveSchema>;
