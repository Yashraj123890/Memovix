import { SearchableSourceType } from "@prisma/client";

import { EmbeddingWorkflow } from "../ai/workflows/embedding.workflow";
import { searchableAdapters } from "../ai/ingestion/searchable/adapters";
import searchableChunkRepository, {
  SearchableChunkInsert,
} from "../repositories/searchableChunk.repository";

/**
 * Unified Retrieval ingestion service (phase P1). Keeps the searchable_chunks
 * index in sync with source content: adapters produce the text, this service
 * embeds it and writes it. It only WRITES the unified index — retrieval/search
 * over it is P2 and lives elsewhere; the legacy MemoryEmbedding / document_chunks
 * read paths are untouched.
 *
 * `*Safe` variants never throw — content sync is best-effort (blueprint NFR 4.4),
 * exactly like memory embedding: a create/update must not fail because the AI
 * provider blipped, and a missed sync is recoverable via `db:reindex-searchable`.
 */
export class SearchableIndexService {
  private embeddingWorkflow = new EmbeddingWorkflow();

  private adapterFor(sourceType: SearchableSourceType) {
    const adapter = searchableAdapters[sourceType];
    if (!adapter) {
      throw new Error(`No searchable adapter registered for ${sourceType}`);
    }
    return adapter;
  }

  /**
   * Index one source row (create OR update — replaceBySource is idempotent).
   * Returns the number of chunks written. When the source has no indexable text
   * (empty/deleted), any existing chunks are removed and 0 is returned. Throws on
   * a genuine failure; callers that must not fail use `syncSafe`.
   */
  async index(sourceType: SearchableSourceType, sourceId: string): Promise<number> {
    const source = await this.adapterFor(sourceType).build(sourceId);

    if (!source || source.units.length === 0) {
      await searchableChunkRepository.deleteBySource(sourceType, sourceId);
      return 0;
    }

    const rows: SearchableChunkInsert[] = [];
    for (const unit of source.units) {
      const embedding =
        unit.embedding ?? (await this.embeddingWorkflow.generate(unit.content)).embedding;
      rows.push({
        chunkIndex: unit.chunkIndex,
        content: unit.content,
        metadata: unit.metadata ?? null,
        embedding,
      });
    }

    await searchableChunkRepository.replaceBySource(source.projectId, sourceType, sourceId, rows);
    return rows.length;
  }

  /** Best-effort index for create/update hooks — never throws. */
  async syncSafe(sourceType: SearchableSourceType, sourceId: string): Promise<void> {
    try {
      await this.index(sourceType, sourceId);
    } catch (error) {
      console.error(
        `[SearchableIndex] Failed to index ${sourceType}:${sourceId} ` +
          `(searchable index may be stale; run db:reindex-searchable):`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  /**
   * Store already-embedded units without calling the embedding provider again.
   * Document ingestion uses this after creating document_chunks, so one upload
   * performs exactly one embedding call per chunk rather than embedding the
   * same text again for the unified searchable index.
   */
  async syncPreparedSafe(
    projectId: string,
    sourceType: SearchableSourceType,
    sourceId: string,
    chunks: SearchableChunkInsert[],
  ): Promise<void> {
    try {
      await searchableChunkRepository.replaceBySource(
        projectId,
        sourceType,
        sourceId,
        chunks,
      );
    } catch (error) {
      console.error(
        `[SearchableIndex] Failed to store prepared ${sourceType}:${sourceId} chunks:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  /** Remove a source's chunks (delete hook). */
  async remove(sourceType: SearchableSourceType, sourceId: string): Promise<void> {
    await searchableChunkRepository.deleteBySource(sourceType, sourceId);
  }

  /** Best-effort remove for delete hooks — never throws. */
  async removeSafe(sourceType: SearchableSourceType, sourceId: string): Promise<void> {
    try {
      await this.remove(sourceType, sourceId);
    } catch (error) {
      console.error(
        `[SearchableIndex] Failed to remove ${sourceType}:${sourceId}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  /**
   * Backfill/reindex every source type for one project — a clean REBUILD: the
   * project's existing chunks are cleared first, so rows from excluded or since-
   * deleted sources leave no residue. Assumes the caller has established the
   * project's tenant context (the backfill wraps this in runWithTenantContext)
   * so reads and writes are correctly RLS-scoped.
   */
  async indexProject(projectId: string): Promise<Record<string, number>> {
    await searchableChunkRepository.deleteByProject(projectId);

    const summary: Record<string, number> = {};
    for (const adapter of Object.values(searchableAdapters)) {
      const sourceIds = await adapter.listIdsForProject(projectId);
      let written = 0;
      for (const sourceId of sourceIds) {
        written += await this.index(adapter.sourceType, sourceId);
      }
      summary[adapter.sourceType] = written;
    }
    return summary;
  }
}

export default new SearchableIndexService();
