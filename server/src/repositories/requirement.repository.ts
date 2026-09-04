import prisma, { withTenantTx } from "../lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Thin Prisma wrapper for structured Requirements (blueprint §3.2.4 / §6.2.8),
 * following the same repository pattern as DeliverableRepository /
 * DecisionRepository. Persistence-only — the AI extraction and review/confirm
 * flow lives in the service layer (Phase 2). Confirmed requirements are the
 * only rows created here; `createMany` supports confirming a reviewed batch in
 * one call.
 */
export class RequirementRepository {
  create(data: Prisma.RequirementCreateInput) {
    return prisma.requirement.create({ data });
  }

  createMany(data: Prisma.RequirementCreateManyInput[]) {
    return prisma.requirement.createMany({ data });
  }

  /**
   * Persist a reviewed batch atomically, returning the created rows (so the
   * caller can emit a Timeline/Audit event per accepted requirement). All-or-
   * nothing: if any insert fails, none are committed.
   */
  createConfirmed(items: Prisma.RequirementCreateManyInput[]) {
    return prisma.$transaction(
      items.map((data) => prisma.requirement.create({ data }))
    );
  }

  /**
   * Redefine the project's Baseline Scope to EXACTLY the given requirement set,
   * atomically (blueprint Scenario A.6). Clearing every flag first and then
   * setting the chosen ids guarantees a single, consistent baseline state — a
   * requirement can never end up in a partial/duplicate baseline.
   */
  setBaselineTransactional(projectId: string, requirementIds: string[]) {
    return withTenantTx(async (tx) => {
      await tx.requirement.updateMany({
        where: { projectId },
        data: { isBaseline: false },
      });

      await tx.requirement.updateMany({
        where: { projectId, id: { in: requirementIds } },
        data: { isBaseline: true },
      });
    });
  }

  findByProject(projectId: string, isBaseline?: boolean) {
    return prisma.requirement.findMany({
      where: {
        projectId,
        ...(isBaseline !== undefined ? { isBaseline } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.requirement.findUnique({ where: { id } });
  }

  /** Lightweight lookup used by projectAccess.middleware for project scoping. */
  getProjectId(id: string) {
    return prisma.requirement.findUnique({
      where: { id },
      select: { projectId: true },
    });
  }

  update(id: string, data: Prisma.RequirementUpdateInput) {
    return prisma.requirement.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.requirement.delete({ where: { id } });
  }
}
