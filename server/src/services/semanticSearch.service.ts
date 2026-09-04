import { SearchableSourceType } from "@prisma/client";

import { EmbeddingWorkflow } from "../ai/workflows/embedding.workflow";
import searchableChunkRepository from "../repositories/searchableChunk.repository";
import { sourceLabel } from "../ai/retrieval/citation";

/**
 * AI Search (P2) — now searches the UNIFIED index, so results span the whole
 * project graph (memories, documents, requirements, decisions, meeting notes,
 * deliverables, comments) instead of memories only. The legacy memory-only
 * repository is left in place (dormant for this path) for a one-file revert.
 */
export interface SemanticSearchResult {
  sourceType: SearchableSourceType;
  sourceId: string;
  title: string;
  content: string;
  /** 0..1, higher = closer match (1 - cosine distance). */
  score: number;
}

interface SearchRow {
  sourceType: SearchableSourceType;
  sourceId: string;
  chunkIndex: number | string;
  content: string;
  metadata: Record<string, unknown> | null;
  distance: number | string;
}

class SemanticSearchService {
  private embeddingWorkflow = new EmbeddingWorkflow();

  // Smaller distance = better match. Preserves the previous AI Search threshold.
  private readonly MAX_DISTANCE = 0.65;

  async search(
    projectId: string,
    query: string,
    limit = 5,
  ): Promise<SemanticSearchResult[]> {
    const { embedding } = await this.embeddingWorkflow.generate(query);

    // Over-fetch so post-filter + per-source dedupe can still fill `limit`.
    const rows = (await searchableChunkRepository.search(
      projectId,
      embedding,
      Math.max(limit * 3, 15),
    )) as SearchRow[];

    const seen = new Set<string>();
    const results: SemanticSearchResult[] = [];

    for (const row of rows) {
      const distance = Number(row.distance);
      if (!Number.isFinite(distance) || distance > this.MAX_DISTANCE) continue;

      // One result per source (a document's best-matching chunk wins).
      const key = `${row.sourceType}:${row.sourceId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        sourceType: row.sourceType,
        sourceId: row.sourceId,
        title: sourceLabel({ sourceType: row.sourceType, metadata: row.metadata }),
        content: row.content,
        score: Number((1 - distance).toFixed(2)),
      });

      if (results.length >= limit) break;
    }

    return results;
  }
}

export default new SemanticSearchService();
