import prisma, { withTenantTx } from "../lib/prisma";
import { Prisma, DecisionCategory, DecisionSourceType } from "@prisma/client";

/**
 * Thin Prisma wrapper for Scope Creep flags (blueprint §6.2.15), following the
 * same repository pattern as the other M6/M7 repositories. The two-step
 * comparison pipeline (M7 Phase 2) writes flags via `upsertByRequirement`
 * (one active flag per requirement — see the @@unique on requirementId); flag
 * actioning (M7 Phase 3) updates `resolution`.
 */
export class ScopeFlagRepository {
  /**
   * Create-or-update the single flag for a requirement. Re-running a comparison
   * therefore refreshes the classification in place instead of duplicating.
   */
  upsertByRequirement(
    requirementId: string,
    data: {
      projectId: string;
      classification: string;
      similarityScore: number;
      rationale: string;
      relatedBaselineId: string | null;
    }
  ) {
    return prisma.scopeFlag.upsert({
      where: { requirementId },
      create: {
        requirementId,
        projectId: data.projectId,
        classification: data.classification,
        similarityScore: data.similarityScore,
        rationale: data.rationale,
        relatedBaselineId: data.relatedBaselineId,
        // resolution defaults to "pending"
      },
      update: {
        classification: data.classification,
        similarityScore: data.similarityScore,
        rationale: data.rationale,
        relatedBaselineId: data.relatedBaselineId,
        resolution: "pending",
      },
    });
  }

  /** Remove a requirement's flag (used when a re-run finds it "already covered"). */
  deleteByRequirement(requirementId: string) {
    return prisma.scopeFlag.deleteMany({ where: { requirementId } });
  }

  findByProject(projectId: string, resolution?: string) {
    return prisma.scopeFlag.findMany({
      where: {
        projectId,
        ...(resolution ? { resolution } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        requirement: { select: { id: true, title: true } },
        relatedBaseline: { select: { id: true, title: true } },
      },
    });
  }

  findById(id: string) {
    return prisma.scopeFlag.findUnique({ where: { id } });
  }

  /** Lightweight lookup for project scoping. */
  getProjectId(id: string) {
    return prisma.scopeFlag.findUnique({
      where: { id },
      select: { projectId: true },
    });
  }

  update(id: string, data: Prisma.ScopeFlagUpdateInput) {
    return prisma.scopeFlag.update({ where: { id }, data });
  }

  /**
   * Accept a flag into scope, ATOMICALLY (blueprint §3.2.6 "updates baseline,
   * logs decision"). In one transaction:
   *   1. compare-and-set the flag pending → accepted_into_scope (exactly-once:
   *      a second/concurrent call sees count 0 and does nothing further),
   *   2. promote the candidate requirement into the baseline (isBaseline=true),
   *   3. append a SCOPE_CHANGE Decision Log entry.
   * Mirrors DeliverableRepository.approveWithDecision. Returns whether THIS call
   * performed the transition (so the service logs Timeline/Audit exactly once).
   */
  acceptIntoScope(
    flagId: string,
    requirementId: string,
    decision: { projectId: string; description: string; loggedById: string }
  ) {
    return withTenantTx(async (tx) => {
      const cas = await tx.scopeFlag.updateMany({
        where: { id: flagId, resolution: "pending" },
        data: { resolution: "accepted_into_scope" },
      });

      if (cas.count === 0) {
        return { transitioned: false as const };
      }

      await tx.requirement.update({
        where: { id: requirementId },
        data: { isBaseline: true },
      });

      const decisionLog = await tx.decisionLog.create({
        data: {
          projectId: decision.projectId,
          category: DecisionCategory.SCOPE,
          description: decision.description,
          sourceType: DecisionSourceType.SCOPE_CHANGE,
          sourceId: flagId,
          loggedById: decision.loggedById,
        },
      });

      return { transitioned: true as const, decisionLog };
    });
  }

  /**
   * Decline a flag (compare-and-set pending → declined). No baseline change, no
   * decision. Returns Prisma's batch payload; count 0 means it was already
   * resolved (exactly-once guard).
   */
  decline(flagId: string) {
    return prisma.scopeFlag.updateMany({
      where: { id: flagId, resolution: "pending" },
      data: { resolution: "declined" },
    });
  }
}
