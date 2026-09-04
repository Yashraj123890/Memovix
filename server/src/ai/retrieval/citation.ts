import { SearchableSourceType } from "@prisma/client";

/**
 * Unified retrieval item (P2) — one row from searchable_chunks search, covering
 * every content type. Replaces the memory/document-only shape the legacy
 * dual-store retrieval produced.
 */
export interface UnifiedRetrievedItem {
  sourceType: SearchableSourceType;
  sourceId: string;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown> | null;
  distance: number;
}

/**
 * A citation shown to the user (chat) or returned as a search result. Carries
 * the source's type + id so the frontend can deep-link, plus a resolved label
 * and a 0..1 score (1 - distance).
 */
export interface UnifiedCitation {
  sourceType: SearchableSourceType;
  sourceId: string;
  label: string;
  score: number;
}

const str = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim() ? value : fallback;

/**
 * Human label for a source — used both in the grounded prompt context ("Source
 * N [<label>]") and in citations/search results. Draws on the chunk's stored
 * metadata (title, fileName) so no extra lookup is needed.
 */
export function sourceLabel(item: {
  sourceType: SearchableSourceType;
  metadata: Record<string, unknown> | null;
}): string {
  const md = item.metadata ?? {};
  switch (item.sourceType) {
    case SearchableSourceType.MEMORY:
      return `Memory: ${str(md.title, "Untitled")}`;
    case SearchableSourceType.DOCUMENT:
      return `Document: ${str(md.fileName, "File")}`;
    case SearchableSourceType.REQUIREMENT:
      return `Requirement: ${str(md.title, "Untitled")}`;
    case SearchableSourceType.DECISION:
      return "Decision";
    case SearchableSourceType.MEETING_NOTE:
      return "Meeting Note";
    case SearchableSourceType.DELIVERABLE:
      return `Deliverable: ${str(md.title, "Untitled")}`;
    case SearchableSourceType.COMMENT:
      return "Comment";
    default:
      return "Source";
  }
}

const score = (distance: number): number => Number((1 - distance).toFixed(2));

/**
 * Collapse retrieved chunks into unique citations — one per (sourceType,
 * sourceId), so a document that contributes several chunks yields a single
 * citation, keeping its best (closest) score. Order follows first appearance
 * (already distance-sorted upstream).
 */
export function dedupeCitations(items: UnifiedRetrievedItem[]): UnifiedCitation[] {
  const byKey = new Map<string, UnifiedCitation>();
  for (const item of items) {
    const key = `${item.sourceType}:${item.sourceId}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        label: sourceLabel(item),
        score: score(item.distance),
      });
    }
  }
  return Array.from(byKey.values());
}

/**
 * Combine multiple retrieved chunks from the same record before assigning
 * prompt source numbers. This keeps `[Source: N]` aligned 1:1 with the
 * deduplicated citations returned to the client.
 */
export function groupRetrievedSources(
  items: UnifiedRetrievedItem[],
  maxChunksPerSource = 3,
): UnifiedRetrievedItem[] {
  const groups = new Map<string, UnifiedRetrievedItem & { chunks: string[] }>();

  for (const item of items) {
    const key = `${item.sourceType}:${item.sourceId}`;
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { ...item, chunks: [item.content] });
      continue;
    }

    existing.distance = Math.min(existing.distance, item.distance);
    if (
      existing.chunks.length < maxChunksPerSource &&
      !existing.chunks.includes(item.content)
    ) {
      existing.chunks.push(item.content);
    }
  }

  return Array.from(groups.values()).map(({ chunks, ...item }) => ({
    ...item,
    content: chunks.join("\n\n"),
  }));
}
