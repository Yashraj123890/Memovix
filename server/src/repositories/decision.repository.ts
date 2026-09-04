import prisma from "../lib/prisma";
import { Prisma, DecisionCategory } from "@prisma/client";

/**
 * Thin Prisma wrapper for the append-only Decision Log (blueprint §3.2.9,
 * §6.2.12). Same repository pattern as DeliverableRepository. No update/delete
 * methods by design — decision entries are immutable; corrections are appended
 * as new entries.
 */
export class DecisionRepository {
    create(data: Prisma.DecisionLogCreateInput) {
        return prisma.decisionLog.create({ data });
    }

    findByProject(projectId: string, category?: DecisionCategory) {
        return prisma.decisionLog.findMany({
            where: {
                projectId,
                ...(category ? { category } : {}),
            },
            orderBy: { createdAt: "desc" },
            include: {
                loggedBy: { select: { id: true, name: true } },
            },
        });
    }
}
