import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Thin Prisma wrapper for Meeting Notes (blueprint §3.2.7 / §6.2.11), following
 * the same repository pattern as DeliverableRepository / DecisionRepository.
 * The raw notes and AI-generated summary are persisted here; embedding of the
 * summary into project memory is handled in the service layer (Phase 3) via the
 * existing MemoryEmbedding pipeline, not this repository.
 */
export class MeetingNoteRepository {
  create(data: Prisma.MeetingNoteCreateInput) {
    return prisma.meetingNote.create({ data });
  }

  findByProject(projectId: string) {
    return prisma.meetingNote.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  findById(id: string) {
    return prisma.meetingNote.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        // Confirmed action items (Meeting Notes v2) for the detail view.
        actionItems: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  /** Lightweight lookup used by projectAccess.middleware for project scoping. */
  getProjectId(id: string) {
    return prisma.meetingNote.findUnique({
      where: { id },
      select: { projectId: true },
    });
  }

  update(id: string, data: Prisma.MeetingNoteUpdateInput) {
    return prisma.meetingNote.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.meetingNote.delete({ where: { id } });
  }
}
