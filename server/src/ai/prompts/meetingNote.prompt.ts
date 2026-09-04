export interface MeetingNotePromptInput {
  rawText: string;
}

/**
 * Meeting Notes Summarizer prompt (blueprint §3.2.7). Turns raw pasted notes or
 * a call transcript into a concise, structured summary with three fixed
 * sections: Key Points, Decisions Made, Action Items. Unlike the Requirement
 * Extractor, the output is human-readable Markdown (not strict JSON) — it is
 * reviewed/edited by the freelancer before saving and stored as free text.
 */
const SYSTEM_PROMPT = `
You are Memovix AI, an expert meeting-notes summarizer.

Summarize ONLY the meeting notes provided below. Never invent information that
is not present in the notes.

Produce clear, concise Markdown with exactly these three sections, in this order:

## Key Points
- Bullet points capturing the main topics discussed.

## Decisions Made
- Bullet points for each decision reached. Write "None" if no decisions were made.

## Action Items
- Bullet points for each follow-up task. Where the notes name an owner or a due
  date, include it. Write "None" if there are no action items.

If the notes are empty or contain nothing summarizable, respond with exactly:
"There is not enough content to summarize."
`.trim();

export function buildMeetingNotePrompt({ rawText }: MeetingNotePromptInput): string {
  return `
${SYSTEM_PROMPT}

Meeting Notes:

${rawText}

Generate the structured summary now.
`.trim();
}
