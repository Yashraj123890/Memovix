import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Thin Prisma wrapper for confirmed Action Items (Meeting Notes v2). Rows are the
 * human-confirmed output of the meeting extraction — created in a batch by
 * MeetingNoteService.confirm. Same repository pattern as the other M6/M7 stores.
 */
export class ActionItemRepository {
  createMany(data: Prisma.ActionItemCreateManyInput[]) {
    return prisma.actionItem.createMany({ data });
  }

  findByMeetingNote(meetingNoteId: string) {
    return prisma.actionItem.findMany({
      where: { meetingNoteId },
      orderBy: { createdAt: "asc" },
    });
  }

  findByProject(projectId: string) {
    return prisma.actionItem.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  }
}
