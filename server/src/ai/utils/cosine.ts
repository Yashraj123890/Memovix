/**
 * Cosine similarity between two equal-length embedding vectors, in [-1, 1]
 * (1 = identical direction). Used by the Scope Creep deterministic pre-filter
 * (blueprint §8.10 Step 1) to short-circuit the LLM call for near-duplicate
 * requirements. Returns 0 for mismatched-length or zero-magnitude inputs.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
