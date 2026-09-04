import { CHAT_FALLBACK_RESPONSE } from "./prompts/chat.prompt";

/** Matches an inline citation like "[Source: 1]" (blueprint §8.8/§11). */
export const CITATION_PATTERN = /\[Source:\s*\d+\]/i;

/**
 * Multiplier applied to a chat answer's confidence when the model produced a
 * non-fallback answer WITHOUT any citation. It de-rates (never rewrites) the
 * response so the application has visibility into contract violations.
 */
export const UNCITED_CONFIDENCE_FACTOR = 0.5;

export interface CitationAssessment {
  /** True when the answer is a real (non-fallback) reply with no [Source: N] citation. */
  uncited: boolean;
  /** Confidence after the uncited penalty (unchanged when compliant). */
  confidence: number;
}

/**
 * Model-compliance metric — NOT an output transformer (blueprint §8.8/§11). It
 * inspects a generated chat answer and decides whether it honoured the "cite
 * [Source: N] or return the exact fallback" contract. It never modifies the
 * answer text; it only flags non-compliance and de-rates confidence so callers
 * can log and surface it. Streaming and one-shot paths share this logic.
 */
export function assessCitations(answer: string, baseConfidence: number): CitationAssessment {
  const isFallback = answer.trim() === CHAT_FALLBACK_RESPONSE;
  const hasCitation = CITATION_PATTERN.test(answer);
  const compliant = isFallback || hasCitation;

  if (compliant) {
    return { uncited: false, confidence: baseConfidence };
  }

  return {
    uncited: true,
    confidence: Number((baseConfidence * UNCITED_CONFIDENCE_FACTOR).toFixed(2)),
  };
}
