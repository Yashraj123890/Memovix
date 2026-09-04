import { RequirementRepository } from "../repositories/requirement.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { ScopeFlagRepository } from "../repositories/scopeFlag.repository";

import { scopeComparisonWorkflow } from "../ai/workflows/scope.workflow";
import { TimelineService } from "./timeline.service";
import auditService from "./audit.service";

/**
 * Scope Creep Detection / Requirement Comparison (blueprint §3.2.5 / §3.2.6 /
 * §8.10 / §8.11). Orchestrates the two-step pipeline over a project's
 * non-baseline requirements (the candidates) against its baseline set.
 *
 * Reuse: RequirementRepository (baseline + candidates), scopeComparisonWorkflow
 * (pre-filter + LLM), ScopeFlagRepository (persistence), Timeline + Audit.
 * This milestone never notifies or emails anyone — flags surface on the
 * dashboard only (§8.10 Step 4), so NotificationService is intentionally not
 * called here.
 */
export class ScopeService {
  private timelineService = new TimelineService();

  constructor(
    private readonly requirementRepository: RequirementRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly scopeFlagRepository: ScopeFlagRepository
  ) {}

  private async requireProject(projectId: string, tenantId: string) {
    const project = await this.projectRepository.findById(projectId, tenantId);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }

  /**
   * Compare every non-baseline requirement against the baseline set. For each
   * candidate: "already covered" removes any stale flag; otherwise a flag is
   * upserted (never duplicated — one flag per requirement). Baseline embeddings
   * are generated once and reused across all candidates.
   */
  async runComparison(input: { projectId: string; tenantId: string; userId: string }) {
    await this.requireProject(input.projectId, input.tenantId);

    const baseline = await this.requirementRepository.findByProject(input.projectId, true);
    if (baseline.length === 0) {
      throw new Error("No baseline scope has been set for this project.");
    }

    const candidates = await this.requirementRepository.findByProject(input.projectId, false);

    // Per-run baseline embedding cache — computed once, reused for every candidate.
    const baselineEmbeddings = await Promise.all(
      baseline.map((item) => scopeComparisonWorkflow.embedRequirement(item))
    );

    let flagged = 0;
    let alreadyCovered = 0;
    const flags = [];

    for (const candidate of candidates) {
      const candidateEmbedding = await scopeComparisonWorkflow.embedRequirement(candidate);

      const result = await scopeComparisonWorkflow.compare(
        candidate,
        candidateEmbedding,
        baseline,
        baselineEmbeddings
      );

      if (result.status === "already_covered") {
        // Remove any stale flag from a previous run — no flag for covered items.
        await this.scopeFlagRepository.deleteByRequirement(candidate.id);
        alreadyCovered++;
        continue;
      }

      const flag = await this.scopeFlagRepository.upsertByRequirement(candidate.id, {
        projectId: input.projectId,
        classification: result.classification,
        similarityScore: result.similarity,
        rationale: result.rationale,
        relatedBaselineId: result.relatedBaselineId,
      });
      flags.push(flag);
      flagged++;
    }

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action: "SCOPE_COMPARISON_RUN",
      description: `Compared ${candidates.length} requirement(s) against baseline; flagged ${flagged}`,
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action: "SCOPE_COMPARISON_RUN",
      entityType: "SCOPE_FLAG",
      details: {
        compared: candidates.length,
        flagged,
        alreadyCovered,
        baselineSize: baseline.length,
      },
    });

    return { compared: candidates.length, flagged, alreadyCovered, flags };
  }

  /** List scope flags for a project, optionally filtered by resolution. */
  async listFlags(projectId: string, tenantId: string, resolution?: string) {
    await this.requireProject(projectId, tenantId);
    return this.scopeFlagRepository.findByProject(projectId, resolution);
  }

  /**
   * Action a scope flag (blueprint §3.2.6). Actions:
   *  - accept_into_scope : atomically resolve + promote requirement to baseline
   *                        + log a SCOPE_CHANGE decision.
   *  - decline           : resolve without touching the baseline.
   *  - propose_change_order : leave the flag pending (no baseline change);
   *                        recorded on the audit trail only.
   *
   * Exactly-once: accept/decline use a compare-and-set on resolution=pending, so
   * a repeated/concurrent call throws instead of double-resolving, double-
   * promoting, or creating a duplicate decision. Timeline + Audit fire exactly
   * once, only when this call performs the action. Never notifies clients.
   */
  async resolveFlag(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    flagId: string;
    action: "accept_into_scope" | "decline" | "propose_change_order";
  }) {
    await this.requireProject(input.projectId, input.tenantId);

    const flag = await this.scopeFlagRepository.findById(input.flagId);
    if (!flag || flag.projectId !== input.projectId) {
      throw new Error("Scope flag not found");
    }

    if (input.action === "propose_change_order") {
      if (flag.resolution !== "pending") {
        throw new Error("Scope flag is already resolved");
      }

      await this.logAction(input, "SCOPE_FLAG_CHANGE_ORDER_PROPOSED", {
        requirementId: flag.requirementId,
      });

      return { flagId: flag.id, action: input.action, resolution: "pending" };
    }

    if (input.action === "decline") {
      const result = await this.scopeFlagRepository.decline(input.flagId);
      if (result.count === 0) {
        throw new Error("Scope flag is already resolved");
      }

      await this.logAction(input, "SCOPE_FLAG_DECLINED", {
        requirementId: flag.requirementId,
      });

      return { flagId: flag.id, action: input.action, resolution: "declined" };
    }

    // accept_into_scope
    const requirement = await this.requirementRepository.findById(flag.requirementId);
    if (!requirement) {
      throw new Error("Requirement not found");
    }

    const result = await this.scopeFlagRepository.acceptIntoScope(
      input.flagId,
      flag.requirementId,
      {
        projectId: input.projectId,
        description: `Accepted scope change into baseline: "${requirement.title}"`,
        loggedById: input.userId,
      }
    );

    if (!result.transitioned) {
      throw new Error("Scope flag is already resolved");
    }

    await this.logAction(input, "SCOPE_FLAG_ACCEPTED", {
      requirementId: flag.requirementId,
      decisionId: result.decisionLog.id,
    });

    return {
      flagId: flag.id,
      action: input.action,
      resolution: "accepted_into_scope",
      requirementId: flag.requirementId,
      decisionId: result.decisionLog.id,
    };
  }

  /** Timeline + Audit for a flag action — fired exactly once, after it succeeds. */
  private async logAction(
    input: { projectId: string; tenantId: string; userId: string; flagId: string; action: string },
    action: string,
    details: Record<string, unknown>
  ) {
    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action,
      description: `Scope flag ${input.action.replace(/_/g, " ")}`,
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action,
      entityType: "SCOPE_FLAG",
      entityId: input.flagId,
      details,
    });
  }
}
