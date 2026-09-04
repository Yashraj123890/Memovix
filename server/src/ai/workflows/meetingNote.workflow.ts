import { ProviderFactory } from "../factory/provider.factory";
import { buildMeetingNotePrompt } from "../prompts/meetingNote.prompt";

export interface MeetingNoteWorkflowInput {
  rawText: string;
}

export interface MeetingNoteWorkflowResponse {
  summary: string;
}

/**
 * Meeting Notes Summarizer (blueprint §3.2.7). Raw notes → LLM → structured
 * Markdown summary. Reuses the shared ChatProvider (same pattern as
 * SummaryWorkflow). This workflow only summarizes; it never persists — saving
 * and memory-indexing happen in MeetingNoteService after human review.
 */
export class MeetingNoteWorkflow {
  private provider = ProviderFactory.getChatProvider();

  async execute(
    input: MeetingNoteWorkflowInput
  ): Promise<MeetingNoteWorkflowResponse> {
    if (!input.rawText.trim()) {
      throw new Error("Meeting notes text is required.");
    }

    const prompt = buildMeetingNotePrompt({ rawText: input.rawText });

    const response = await this.provider.generateResponse({
      messages: [{ role: "user", content: prompt }],
    });

    return { summary: response.message };
  }
}

export const meetingNoteWorkflow = new MeetingNoteWorkflow();
