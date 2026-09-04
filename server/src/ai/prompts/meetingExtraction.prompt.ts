export interface MeetingExtractionPromptInput {
  transcript: string;
}

/**
 * Combined meeting-extraction prompt (Meeting Notes v2). ONE generation returns a
 * summary PLUS the decisions and action items explicitly present in the
 * transcript — constrained to strict JSON by the provider `format` schema (see
 * meetingExtraction.workflow.ts). The anti-hallucination rules are the core
 * contract: never invent owners, dates, decisions, or action items.
 */
const SYSTEM_PROMPT = `
You are Memovix AI, an expert at turning a meeting transcript into structured
project knowledge.

Work ONLY from the transcript below. Never invent, assume, or infer anything that
is not explicitly stated. Produce three things:

1. "summary": a concise Markdown summary of the meeting — a short overview
   followed by a few "Key Points" bullets. Keep it factual and brief.

2. "decisions": every DECISION the group actually reached. For each, write a
   clear one-sentence "description" and a "category" that is EXACTLY one of:
   SCOPE, TIMELINE, BUDGET, DESIGN, OTHER. If no decisions were made, return [].

3. "actionItems": every follow-up TASK someone committed to. For each, write a
   "description". Set "owner" ONLY if the transcript names who is responsible;
   set "dueDate" ONLY if the transcript states when it is due. If either is not
   stated, omit it (do NOT guess a name or a date). If there are no action items,
   return [].

Return STRICT JSON matching the requested schema. No prose outside the JSON.
`.trim();

export function buildMeetingExtractionPrompt({
  transcript,
}: MeetingExtractionPromptInput): string {
  return `
${SYSTEM_PROMPT}

Transcript:

${transcript}

Extract the summary, decisions, and action items now as JSON.
`.trim();
}
