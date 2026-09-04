/**
 * Scope Creep Detection configuration (blueprint §3.2.6 / §8.10 / §11.7).
 *
 * The similarity threshold is the one value §11.7 explicitly says must be
 * env-tunable and reviewed against real data — it is the cost/accuracy knob for
 * the deterministic pre-filter (candidate cosine-similarity ≥ threshold against
 * a baseline item ⇒ "already covered", no LLM call). Default 0.92 per §8.10.
 *
 * `classifications` and `resolutions` are the fixed vocabularies the pipeline
 * logic branches on, so they are code constants (single source of truth reused
 * by the Zod validators), not env-tuned like a free label.
 */
export const ScopeConfig = {
  /** Cosine-similarity cutoff for the "already covered" fast path (§8.10 Step 1). */
  similarityThreshold: Number(process.env.SCOPE_SIMILARITY_THRESHOLD) || 0.92,

  /** LLM classification vocabulary (§8.10 Step 2 output). */
  classifications: ["new", "modifies_existing", "out_of_scope"] as const,

  /** Flag resolution vocabulary (§6.2.15). "pending" is the initial state. */
  resolutions: ["pending", "accepted_into_scope", "declined"] as const,
} as const;

export type ScopeClassification = (typeof ScopeConfig.classifications)[number];
export type ScopeResolution = (typeof ScopeConfig.resolutions)[number];
