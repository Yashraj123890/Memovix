import { ProviderFactory } from "../factory/provider.factory";
import { AIConfig } from "../config/ai.config";
import { buildMeetingExtractionPrompt } from "../prompts/meetingExtraction.prompt";
import { MeetingExtractionResult } from "../types/meetingExtraction.types";
import { meetingExtractionResultSchema } from "../../validators/meetingExtraction.validator";

/**
 * Combined Meeting Extraction (Meeting Notes v2). ONE structured-JSON generation
 * turns a transcript into { summary, decisions[], actionItems[] } — validated in
 * Phase 0 (llama3.2:3b: 4/4 decisions + 4/4 owned action items, zero
 * hallucination, single ~138s call). A single call (vs. two) is the key lever for
 * keeping the 5–10 min meeting case fast under the background job's timeout.
 *
 * This workflow NEVER persists — it only proposes. Persistence happens later, on
 * explicit human confirmation (MeetingNoteService.confirm), mirroring the
 * requirement propose→confirm flow.
 */

/**
 * Provider-native structured-output schema (Ollama `format`). Forces the model to
 * emit exactly the object shape — no prose, no markdown fences — so the output
 * parses on the first attempt.
 */
const EXTRACTION_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          category: {
            type: "string",
            enum: ["SCOPE", "TIMELINE", "BUDGET", "DESIGN", "OTHER"],
          },
        },
        required: ["description", "category"],
        additionalProperties: false,
      },
    },
    actionItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          owner: { type: ["string", "null"] },
          dueDate: { type: ["string", "null"] },
        },
        required: ["description", "owner", "dueDate"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "decisions", "actionItems"],
  additionalProperties: false,
} as const;

export interface MeetingExtractionInput {
  transcript: string;
}

export class MeetingExtractionWorkflow {
  private provider = ProviderFactory.getChatProvider();

  async execute(input: MeetingExtractionInput): Promise<MeetingExtractionResult> {
    const transcript = input.transcript?.trim();
    if (!transcript) {
      throw new Error("Transcript is required for extraction.");
    }

    const prompt = buildMeetingExtractionPrompt({ transcript });

    const response = await this.provider.generateResponse({
      messages: [{ role: "user", content: prompt }],
      format: EXTRACTION_OUTPUT_SCHEMA,
      options: { num_predict: AIConfig.meetingExtraction.maxOutputTokens, temperature: 0 },
      // Background job → long timeout (Phase 0 measured ~138s on the CPU model).
      timeoutMs: AIConfig.meetingExtraction.timeoutMs,
    });

    const parsed = this.parseJsonObject(response.message);

    const result = meetingExtractionResultSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        "AI returned meeting extraction in an unexpected format. Please retry."
      );
    }

    return result.data;
  }

  /**
   * Extract a JSON object from the model's raw text — strips ``` fences and any
   * stray prose around the object. The `format` schema makes a clean object the
   * normal case; this only guards against a stray wrapper.
   */
  private parseJsonObject(raw: string): unknown {
    let text = raw.trim();

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      text = fenced[1].trim();
    }

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) {
      throw new Error(
        "AI returned meeting extraction in an unexpected format. Please retry."
      );
    }

    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      throw new Error(
        "AI returned meeting extraction in an unexpected format. Please retry."
      );
    }
  }
}

export const meetingExtractionWorkflow = new MeetingExtractionWorkflow();
