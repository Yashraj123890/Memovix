import { MemoryCategory, SearchableSourceType } from "@prisma/client";

import prisma from "../../../lib/prisma";
import { SearchableAdapter, SearchableSource } from "./adapter.types";

/**
 * Source adapters for the Unified Retrieval index (phase P1). Each turns one
 * content type into searchable units. All but DOCUMENT embed a single
 * whole-record unit; DOCUMENT mirrors the already-chunked document text.
 *
 * Timeline is deliberately NOT represented here — activity is retrieved as
 * structured context via a separate path (design decision), not embedded.
 */

const nonEmpty = (value: string | null | undefined): string => (value ?? "").trim();

const ids = (rows: { id: string }[]): string[] => rows.map((row) => row.id);

const memoryAdapter: SearchableAdapter = {
  sourceType: SearchableSourceType.MEMORY,
  async build(id): Promise<SearchableSource | null> {
    const m = await prisma.memory.findUnique({
      where: { id },
      select: {
        projectId: true,
        title: true,
        content: true,
        category: true,
        customCategory: true,
      },
    });
    if (!m) return null;
    // MEETING-category memories are the legacy meeting-note piggyback; the note
    // is already indexed as a first-class MEETING_NOTE, so skip it here to avoid
    // double-indexing the same content.
    if (m.category === MemoryCategory.MEETING) return null;
    const content = nonEmpty(`${m.title}\n${m.content}`);
    if (!content) return null;
    return {
      projectId: m.projectId,
      units: [{
        chunkIndex: 0,
        content,
        metadata: { title: m.title, category: m.customCategory ?? m.category },
      }],
    };
  },
  async listIdsForProject(projectId) {
    return ids(
      await prisma.memory.findMany({
        where: { projectId, category: { not: MemoryCategory.MEETING } },
        select: { id: true },
      }),
    );
  },
};

const requirementAdapter: SearchableAdapter = {
  sourceType: SearchableSourceType.REQUIREMENT,
  async build(id): Promise<SearchableSource | null> {
    const r = await prisma.requirement.findUnique({
      where: { id },
      select: { projectId: true, title: true, description: true, category: true },
    });
    if (!r) return null;
    const content = nonEmpty(`${r.title}\n${r.description ?? ""}`);
    if (!content) return null;
    return {
      projectId: r.projectId,
      units: [{ chunkIndex: 0, content, metadata: { title: r.title, category: r.category } }],
    };
  },
  async listIdsForProject(projectId) {
    return ids(await prisma.requirement.findMany({ where: { projectId }, select: { id: true } }));
  },
};

const decisionAdapter: SearchableAdapter = {
  sourceType: SearchableSourceType.DECISION,
  async build(id): Promise<SearchableSource | null> {
    const d = await prisma.decisionLog.findUnique({
      where: { id },
      select: {
        projectId: true,
        description: true,
        category: true,
        customCategory: true,
      },
    });
    if (!d) return null;
    const content = nonEmpty(d.description);
    if (!content) return null;
    return {
      projectId: d.projectId,
      units: [{
        chunkIndex: 0,
        content,
        metadata: { category: d.customCategory ?? d.category },
      }],
    };
  },
  async listIdsForProject(projectId) {
    return ids(await prisma.decisionLog.findMany({ where: { projectId }, select: { id: true } }));
  },
};

const meetingNoteAdapter: SearchableAdapter = {
  sourceType: SearchableSourceType.MEETING_NOTE,
  async build(id): Promise<SearchableSource | null> {
    const n = await prisma.meetingNote.findUnique({
      where: { id },
      select: { projectId: true, summary: true },
    });
    if (!n) return null;
    const content = nonEmpty(n.summary);
    if (!content) return null;
    return {
      projectId: n.projectId,
      units: [{ chunkIndex: 0, content, metadata: {} }],
    };
  },
  async listIdsForProject(projectId) {
    return ids(await prisma.meetingNote.findMany({ where: { projectId }, select: { id: true } }));
  },
};

const deliverableAdapter: SearchableAdapter = {
  sourceType: SearchableSourceType.DELIVERABLE,
  async build(id): Promise<SearchableSource | null> {
    const d = await prisma.deliverable.findUnique({
      where: { id },
      select: { projectId: true, title: true, description: true, status: true },
    });
    if (!d) return null;
    const content = nonEmpty(`${d.title}\n${d.description ?? ""}`);
    if (!content) return null;
    return {
      projectId: d.projectId,
      units: [{ chunkIndex: 0, content, metadata: { title: d.title, status: d.status } }],
    };
  },
  async listIdsForProject(projectId) {
    return ids(await prisma.deliverable.findMany({ where: { projectId }, select: { id: true } }));
  },
};

const commentAdapter: SearchableAdapter = {
  sourceType: SearchableSourceType.COMMENT,
  async build(id): Promise<SearchableSource | null> {
    const c = await prisma.comment.findUnique({
      where: { id },
      select: {
        content: true,
        memory: { select: { projectId: true } },
        file: { select: { projectId: true } },
      },
    });
    if (!c) return null;
    const projectId = c.memory?.projectId ?? c.file?.projectId;
    const content = nonEmpty(c.content);
    if (!projectId || !content) return null;
    return { projectId, units: [{ chunkIndex: 0, content, metadata: {} }] };
  },
  async listIdsForProject(projectId) {
    return ids(
      await prisma.comment.findMany({
        where: { OR: [{ memory: { projectId } }, { file: { projectId } }] },
        select: { id: true },
      }),
    );
  },
};

const documentAdapter: SearchableAdapter = {
  sourceType: SearchableSourceType.DOCUMENT,
  async build(fileId): Promise<SearchableSource | null> {
    const file = await prisma.projectFile.findUnique({
      where: { id: fileId },
      select: { projectId: true, originalName: true },
    });
    if (!file) return null;

    // Reuse the text already chunked by the ingestion pipeline (document_chunks);
    // the index service re-embeds it into searchable_chunks.
    const chunks = await prisma.documentChunk.findMany({
      where: { fileId },
      orderBy: { chunkIndex: "asc" },
      select: { chunkIndex: true, content: true },
    });
    if (chunks.length === 0) return null;

    return {
      projectId: file.projectId,
      units: chunks.map((chunk) => ({
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        metadata: { fileName: file.originalName },
      })),
    };
  },
  async listIdsForProject(projectId) {
    // Only INDEXED files have document_chunks to mirror.
    return ids(
      await prisma.projectFile.findMany({
        where: { projectId, ingestStatus: "INDEXED" },
        select: { id: true },
      }),
    );
  },
};

/** sourceType → adapter. The single place a new content type is registered. */
export const searchableAdapters: Record<SearchableSourceType, SearchableAdapter> = {
  [SearchableSourceType.MEMORY]: memoryAdapter,
  [SearchableSourceType.REQUIREMENT]: requirementAdapter,
  [SearchableSourceType.DECISION]: decisionAdapter,
  [SearchableSourceType.MEETING_NOTE]: meetingNoteAdapter,
  [SearchableSourceType.DELIVERABLE]: deliverableAdapter,
  [SearchableSourceType.COMMENT]: commentAdapter,
  [SearchableSourceType.DOCUMENT]: documentAdapter,
};
