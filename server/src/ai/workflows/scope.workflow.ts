import { ProviderFactory } from "../factory/provider.factory";
import { EmbeddingWorkflow } from "./embedding.workflow";
import { cosineSimilarity } from "../utils/cosine";
import {
  buildScopeClassificationPrompt,
  ScopeClassificationBaselineItem,
} from "../prompts/scope.prompt";
import { scopeClassificationSchema } from "../../validators/scope.validator";
import { ScopeConfig } from "../../config/scope.config";

export interface ScopeRequirementInput {
  id: string;
  title: string;
  description: string | null;
}

export type ScopeCompareResult =
  | {
      status: "already_covered";
      similarity: number;
      nearestBaselineId: string | null;
    }
  | {
      status: "flagged";
      classification: string;
      similarity: number;
      rationale: string;
      relatedBaselineId: string | null;
    };

/**
 * Scope Creep Detection pipeline (blueprint §8.10 / §8.11). Replaces the
 * free-text prototype with the mandated TWO-STEP flow:
 *
 *   Step 1 (deterministic, no cost): embed the candidate and take its highest
 *   cosine similarity against the baseline embeddings. If that meets the
 *   env-tuned threshold (ScopeConfig.similarityThreshold, default 0.92), the
 *   candidate is "already covered" and we STOP — no LLM call.
 *
 *   Step 2 (LLM, only for the non-obvious remainder): classify the candidate as
 *   new / modifies_existing / out_of_scope, validated as strict JSON.
 *
 * Baseline embeddings are computed once per run by the caller (ScopeService) and
 * passed in, so they are never regenerated per candidate.
 */

/**
 * Provider-native structured-output schema (Ollama `format`) for the Step-2
 * classification. The local llama3.2:3b emitted invalid JSON ~60% of the time on
 * this prompt (unquoted `rationale` values), which threw and aborted the whole
 * comparison run. Constraining decoding to this schema — including the enum for
 * `classification` — forces a well-formed object every time. Built from
 * ScopeConfig so the allowed values never drift from the Zod validator.
 */
const SCOPE_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    classification: { type: "string", enum: [...ScopeConfig.classifications] },
    rationale: { type: "string" },
    related_baseline_id: { type: ["string", "null"] },
  },
  required: ["classification", "rationale", "related_baseline_id"],
  additionalProperties: false,
} as const;

/** Small safety cap — one classification object is tiny; this only guards a runaway. */
const SCOPE_MAX_OUTPUT_TOKENS = 512;

export class ScopeComparisonWorkflow {
  private provider = ProviderFactory.getChatProvider();
  private embeddingWorkflow = new EmbeddingWorkflow();

  private embedText(requirement: ScopeRequirementInput): string {
    return `${requirement.title}\n${requirement.description ?? ""}`.trim();
  }

  /** Embed a requirement's text (reuses the shared EmbeddingWorkflow). */
  async embedRequirement(requirement: ScopeRequirementInput): Promise<number[]> {
    const result = await this.embeddingWorkflow.generate(this.embedText(requirement));
    return result.embedding;
  }

  /**
   * Run the two-step comparison for a single candidate against the baseline.
   * `baselineEmbeddings[i]` must correspond to `baseline[i]`.
   */
  async compare(
    candidate: ScopeRequirementInput,
    candidateEmbedding: number[],
    baseline: ScopeRequirementInput[],
    baselineEmbeddings: number[][]
  ): Promise<ScopeCompareResult> {
    // --- Step 1: deterministic pre-filter (no LLM) ---
    let maxSimilarity = 0;
    let nearestBaselineId: string | null = null;

    for (let i = 0; i < baseline.length; i++) {
      const similarity = cosineSimilarity(candidateEmbedding, baselineEmbeddings[i]);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        nearestBaselineId = baseline[i].id;
      }
    }

    if (maxSimilarity >= ScopeConfig.similarityThreshold) {
      return {
        status: "already_covered",
        similarity: maxSimilarity,
        nearestBaselineId,
      };
    }

    // --- Step 2: LLM classification (only reached for non-obvious cases) ---
    const classification = await this.classify(candidate, baseline);

    // Prefer the LLM's related_baseline_id, but only if it names a real baseline
    // item; otherwise fall back to the nearest item from the pre-filter.
    const baselineIds = new Set(baseline.map((item) => item.id));
    const relatedBaselineId =
      classification.related_baseline_id && baselineIds.has(classification.related_baseline_id)
        ? classification.related_baseline_id
        : nearestBaselineId;

    return {
      status: "flagged",
      classification: classification.classification,
      similarity: maxSimilarity,
      rationale: classification.rationale,
      relatedBaselineId,
    };
  }

  private async classify(
    candidate: ScopeRequirementInput,
    baseline: ScopeClassificationBaselineItem[]
  ) {
    const prompt = buildScopeClassificationPrompt({ candidate, baseline });

    const response = await this.provider.generateResponse({
      messages: [{ role: "user", content: prompt }],
      format: SCOPE_OUTPUT_SCHEMA,
      options: { num_predict: SCOPE_MAX_OUTPUT_TOKENS },
    });

    const parsed = this.parseJsonObject(response.message);

    const result = scopeClassificationSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        "AI returned a scope classification in an unexpected format. Please try again."
      );
    }

    return result.data;
  }

  /** Robustly extract a single JSON object from the model's raw text. */
  private parseJsonObject(raw: string): unknown {
    let text = raw.trim();

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      text = fenced[1].trim();
    }

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      text = text.slice(start, end + 1);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "AI returned a scope classification in an unexpected format. Please try again."
      );
    }
  }
}

export const scopeComparisonWorkflow = new ScopeComparisonWorkflow();
