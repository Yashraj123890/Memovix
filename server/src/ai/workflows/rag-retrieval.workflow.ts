import { SearchableSourceType } from "@prisma/client";

import searchableChunkRepository from "../../repositories/searchableChunk.repository";
import { EmbeddingWorkflow } from "./embedding.workflow";
import { AIConfig } from "../config/ai.config";
import { UnifiedRetrievedItem } from "../retrieval/citation";

/**
 * Unified RAG retrieval (Unified Retrieval phase — P2). One query embedding runs
 * a single project-scoped vector search over `searchable_chunks`, which now
 * spans the whole project graph (memories, documents, requirements, decisions,
 * meeting notes, deliverables, comments) — replacing the old two-index fan-out
 * across MemoryEmbedding + document_chunks.
 *
 * The legacy per-store repositories still exist (dormant for retrieval) so this
 * cutover is a one-file revert if needed; they are removed in P3.
 */
export type { UnifiedRetrievedItem as RetrievedItem } from "../retrieval/citation";

interface SearchRow {
  sourceType: SearchableSourceType;
  sourceId: string;
  chunkIndex: number | string;
  content: string;
  metadata: Record<string, unknown> | null;
  distance: number | string;
  keywordRank?: number | string;
  phraseMatch?: number | string;
}

interface RetrievalOptions {
  limit?: number;
  maxDistance?: number;
  sourceTypes?: SearchableSourceType[];
  strictRelevance?: boolean;
}

const STOP_WORDS = new Set([
  "a", "about", "an", "and", "are", "as", "at", "be", "by", "did", "do",
  "does", "for", "from", "how", "i", "in", "is", "it", "me", "of", "on",
  "or", "our", "project", "tell", "that", "the", "this", "to", "was", "were",
  "what", "when", "where", "which", "who", "why", "with",
]);

const termsFor = (value: string): string[] =>
  Array.from(new Set(
    value.toLowerCase().match(/[a-z0-9][a-z0-9_-]*/g)?.filter(
      (term) => term.length > 1 && !STOP_WORDS.has(term),
    ) ?? [],
  ));

const rowKey = (row: SearchRow): string =>
  `${row.sourceType}:${row.sourceId}:${Number(row.chunkIndex)}`;

export class RagRetrievalWorkflow {
  private embeddingWorkflow = new EmbeddingWorkflow();

  async retrieve(
    projectId: string,
    query: string,
    options?: RetrievalOptions,
  ): Promise<UnifiedRetrievedItem[]> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }
    if (!query.trim()) {
      throw new Error("Query is required.");
    }

    const limit = options?.limit ?? AIConfig.ragTopK;
    const maxDistance = options?.maxDistance ?? AIConfig.ragMaxDistance;

    const { embedding } = await this.embeddingWorkflow.generate(query);
    const queryTerms = termsFor(query);
    const candidateLimit = Math.max(limit * 3, 24);
    const tsQuery = queryTerms.map((term) => term.replace(/[^a-z0-9_]/g, "")).filter(Boolean).join(" | ");
    const normalizedPhrase = query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    const [vectorRows, keywordRows] = await Promise.all([
      searchableChunkRepository.search(
        projectId,
        embedding,
        candidateLimit,
        options?.sourceTypes,
      ) as Promise<SearchRow[]>,
      tsQuery
        ? searchableChunkRepository.searchKeyword(
            projectId,
            embedding,
            tsQuery,
            normalizedPhrase,
            candidateLimit,
            options?.sourceTypes,
          ) as Promise<SearchRow[]>
        : Promise.resolve([] as SearchRow[]),
    ]);

    const merged = new Map<string, SearchRow & { vectorRank?: number; keywordOrder?: number }>();
    vectorRows.forEach((row, index) => merged.set(rowKey(row), { ...row, vectorRank: index + 1 }));
    keywordRows.forEach((row, index) => {
      const key = rowKey(row);
      const existing = merged.get(key);
      merged.set(key, { ...existing, ...row, vectorRank: existing?.vectorRank, keywordOrder: index + 1 });
    });

    const ranked = Array.from(merged.values())
      .map((row) => {
        const distance = Number(row.distance);
        const contentTerms = new Set(termsFor(row.content));
        const overlap = queryTerms.length === 0
          ? 0
          : queryTerms.filter((term) => contentTerms.has(term)).length / queryTerms.length;
        const vectorSimilarity = Math.max(0, Math.min(1, 1 - distance));
        const phraseMatch = Number(row.phraseMatch ?? 0) > 0 ? 1 : 0;
        const reciprocalRank =
          (row.vectorRank ? 1 / (60 + row.vectorRank) : 0) +
          (row.keywordOrder ? 1 / (60 + row.keywordOrder) : 0);
        const combinedScore =
          vectorSimilarity * 0.55 + overlap * 0.3 + phraseMatch * 0.1 + reciprocalRank * 3;

        return {
          item: {
        sourceType: row.sourceType,
        sourceId: row.sourceId,
        chunkIndex: Number(row.chunkIndex),
        content: row.content,
        metadata: row.metadata,
            distance,
          } satisfies UnifiedRetrievedItem,
          overlap,
          phraseMatch,
          vectorSimilarity,
          combinedScore,
        };
      })
      .filter(({ item }) => Number.isFinite(item.distance));

    const bestScore = Math.max(0, ...ranked.map((candidate) => candidate.combinedScore));
    const strictRelevance = options?.strictRelevance ?? true;
    const filtered = ranked.filter((candidate) => {
      if (!strictRelevance) return candidate.item.distance <= maxDistance;
      const lexicalMatch = candidate.overlap > 0 || candidate.phraseMatch > 0;
      const semanticMatch = candidate.item.distance <= maxDistance && candidate.vectorSimilarity >= 0.35;
      // Relative-to-best cutoff removes generic records that only share a
      // common word (for example "approved") with an otherwise specific query.
      const adaptiveThreshold = Math.max(0.2, bestScore * 0.65);
      return (lexicalMatch || semanticMatch) && candidate.combinedScore >= adaptiveThreshold;
    });

    return filtered
      .sort((a, b) => b.combinedScore - a.combinedScore || a.item.distance - b.item.distance)
      .map(({ item }) => item)
      .slice(0, limit);
  }
}

export const ragRetrievalWorkflow = new RagRetrievalWorkflow();
