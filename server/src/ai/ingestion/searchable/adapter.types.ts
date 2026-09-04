import { SearchableSourceType } from "@prisma/client";

/** One indexable unit produced by an adapter. */
export interface SearchableUnit {
  chunkIndex: number;
  content: string;
  metadata?: Record<string, unknown> | null;
  /**
   * Pre-computed embedding, when the source already carries one. Left unset by
   * every adapter today (the index service embeds `content`); the field exists
   * so a future adapter can reuse an existing vector without re-embedding.
   */
  embedding?: number[];
}

/** What an adapter returns for a single source id. */
export interface SearchableSource {
  projectId: string;
  units: SearchableUnit[];
}

/**
 * A source-type adapter (Unified Retrieval phase — P1). Turns a source row (or
 * its chunks) into searchable units, and enumerates a project's source ids for
 * backfill. Reads go through the shared app-role Prisma client, so they are
 * tenant-scoped by the ambient tenant context (the request, or the backfill's
 * runWithTenantContext) — an adapter never sees another tenant's rows.
 */
export interface SearchableAdapter {
  readonly sourceType: SearchableSourceType;
  /** Build indexable units for one source id; null when the row is gone/empty. */
  build(sourceId: string): Promise<SearchableSource | null>;
  /** All source ids for a project (backfill enumeration), tenant-scoped by RLS. */
  listIdsForProject(projectId: string): Promise<string[]>;
}
