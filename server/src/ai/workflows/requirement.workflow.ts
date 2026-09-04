import { SearchableSourceType } from "@prisma/client";

import { ProviderFactory } from "../factory/provider.factory";
import { buildRequirementPrompt } from "../prompts/requirement.prompt";
import { ragRetrievalWorkflow } from "./rag-retrieval.workflow";
import { sourceLabel } from "../retrieval/citation";
import { ExtractedRequirement } from "../types/requirement.types";
import { extractedRequirementsArraySchema } from "../../validators/requirement.validator";

export interface RequirementWorkflowInput {
  projectId: string;
  projectName: string;
  /**
   * Optional source text to extract from (e.g. a brief's ingested chunks). When
   * omitted, the workflow falls back to the project's semantic memory — the
   * original behavior.
   */
  sourceText?: string;
}

export interface RequirementWorkflowResponse {
  requirements: ExtractedRequirement[];
}

/**
 * Provider-native structured-output schema (Ollama `format`): forces the model
 * to emit a JSON ARRAY of concise 3-field objects — no prose, no markdown, and
 * crucially an array (a bare `format: "json"` produced a single object, which
 * failed the Zod array schema). Constrained decoding also stops the runaway
 * verbosity that made unconstrained generation take ~5.5 min on the CPU model.
 */
const REQUIREMENTS_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    requirements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
        },
        required: ["title", "description", "category"],
        additionalProperties: false,
      },
    },
  },
  required: ["requirements"],
  additionalProperties: false,
} as const;

/**
 * Hard ceiling on generated tokens — a safety net so a pathologically large
 * source can never regress to a multi-minute blocking generation. Comfortably
 * fits ~14 concise requirements; if a larger document is truncated at this cap,
 * parseJsonArray salvages the complete leading objects (below) rather than
 * failing, and the reviewer can re-run for more. Chosen so that even a full-cap
 * generation on the local CPU model completes comfortably under the backend's
 * 120s AI timeout (measured ~90–110s at this size), instead of the ~5.5 min an
 * unbounded generation took.
 */
const REQUIREMENTS_MAX_OUTPUT_TOKENS = 320;

/**
 * Total character budget for the project-memory fallback context (P3). Bounds the
 * prompt so extraction stays under the backend timeout on the local CPU model,
 * now that the unified index can return long document chunks.
 */
const REQUIREMENT_CONTEXT_CHARS = 4500;

/**
 * Requirement Extractor (blueprint §3.2.4). Evolved from free-text output to
 * strict JSON: the model returns a JSON array, which is parsed defensively and
 * validated with Zod before being returned as review candidates. This workflow
 * NEVER persists — it only proposes. Persistence happens later, and only on
 * explicit human confirmation, in RequirementService.confirm.
 */
export class RequirementWorkflow {
  private provider = ProviderFactory.getChatProvider();

  async execute(
    input: RequirementWorkflowInput
  ): Promise<RequirementWorkflowResponse> {
    const { projectId, projectName, sourceText } = input;

    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    const context = sourceText?.trim()
      ? sourceText
      : await this.buildMemoryContext(projectId, projectName);

    if (!context.trim()) {
      // Nothing to extract from — return an empty proposal rather than calling
      // the LLM with no context.
      return { requirements: [] };
    }

    const prompt = buildRequirementPrompt({ projectName, context });

    const response = await this.provider.generateResponse({
      messages: [{ role: "user", content: prompt }],
      format: REQUIREMENTS_OUTPUT_SCHEMA,
      options: { num_predict: REQUIREMENTS_MAX_OUTPUT_TOKENS },
    });

    const parsed = this.parseJsonArray(response.message);

    // Validate the AI output; malformed structure is rejected and surfaced to
    // the caller (blueprint: never silently discard bad output).
    const result = extractedRequirementsArraySchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        "AI returned requirements in an unexpected format. Please try again or add requirements manually."
      );
    }

    return { requirements: result.data };
  }

  private async buildMemoryContext(
    projectId: string,
    projectName: string
  ): Promise<string> {
    // P3: draw the fallback context from the unified index, but restricted to
    // SOURCE MATERIAL — MEMORY + DOCUMENT — so extraction never feeds on existing
    // REQUIREMENT/DECISION/etc. chunks and re-proposes them as new requirements.
    const items = await ragRetrievalWorkflow.retrieve(projectId, projectName, {
      limit: 20,
      maxDistance: 2,
      sourceTypes: [SearchableSourceType.MEMORY, SearchableSourceType.DOCUMENT],
      strictRelevance: false,
    });

    // Bound the TOTAL context (not per-item) to keep the prompt within what the
    // local CPU model can process under the backend timeout — the unified index
    // now includes long document chunks. Whole, closest-first items are kept
    // until the budget is reached (never truncating a document mid-requirement).
    const blocks: string[] = [];
    let used = 0;
    for (const item of items) {
      const block = `${sourceLabel(item)}:\n${item.content}`;
      if (blocks.length > 0 && used + block.length > REQUIREMENT_CONTEXT_CHARS) break;
      blocks.push(block);
      used += block.length;
    }

    return blocks.join("\n---------------------\n");
  }

  /**
   * Robustly extract a JSON array from the model's raw text — strips ``` fences
   * and any leading/trailing prose the model may add despite instructions.
   *
   * Salvage path: when the bounded generation (num_predict) truncates the array
   * mid-object, the raw text is a valid prefix with a dangling tail and no
   * closing `]`. Rather than discard an otherwise-good extraction, we re-close
   * the array after the last COMPLETE object (`}`), keeping every fully-formed
   * requirement and dropping only the partial trailing one. A well-formed array
   * still parses on the first attempt, so this only engages on truncation.
   * Throws a user-facing error only when nothing parseable can be recovered.
   */
  private parseJsonArray(raw: string): unknown {
    let text = raw.trim();

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      text = fenced[1].trim();
    }

    const start = text.indexOf("[");
    if (start === -1) {
      throw new Error(
        "AI returned requirements in an unexpected format. Please try again or add requirements manually."
      );
    }

    // 1) Normal case: a complete, well-formed array.
    const end = text.lastIndexOf("]");
    if (end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        // fall through to salvage
      }
    }

    // 2) Salvage a truncated array: close it after the last complete object.
    const lastBrace = text.lastIndexOf("}");
    if (lastBrace > start) {
      try {
        return JSON.parse(text.slice(start, lastBrace + 1) + "]");
      } catch {
        // fall through to the error below
      }
    }

    throw new Error(
      "AI returned requirements in an unexpected format. Please try again or add requirements manually."
    );
  }
}

export const requirementWorkflow = new RequirementWorkflow();
