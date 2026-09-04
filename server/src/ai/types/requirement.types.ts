/**
 * AI-proposed requirement candidate (blueprint §3.2.4). This is the shape the
 * Requirement Extractor emits as strict JSON and returns to the freelancer for
 * review — it is deliberately NOT the persisted row. Nothing here is written to
 * the database until the freelancer confirms (Accept / Edit & Save); see
 * RequirementService.confirm. `category` and `sourceExcerpt` may be null when
 * the model couldn't determine them — the reviewer fills them in before saving.
 */
export interface ExtractedRequirement {
  title: string;
  description: string | null;
  category: string | null;
  sourceExcerpt: string | null;
}

/**
 * A proposal returned to the review UI: an extracted requirement plus an
 * ephemeral `tempId` the frontend uses to key, edit and reorder items before
 * confirmation. The `tempId` is generated per extraction response and is NEVER
 * persisted — only confirmed requirements become database rows.
 */
export interface ExtractedRequirementProposal extends ExtractedRequirement {
  tempId: string;
}
