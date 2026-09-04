import { randomUUID } from "node:crypto";
import { Requirement, SearchableSourceType } from "@prisma/client";

import { RequirementRepository } from "../repositories/requirement.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectFileRepository } from "../repositories/project-file.repository";
import documentChunkRepository from "../repositories/document-chunk.repository";

import { requirementWorkflow } from "../ai/workflows/requirement.workflow";
import { ExtractedRequirementProposal } from "../ai/types/requirement.types";
import {
  ConfirmRequirementItem,
  UpdateRequirementInput,
} from "../validators/requirement.validator";

import { TimelineService } from "./timeline.service";
import searchableIndexService from "./searchableIndex.service";
import auditService from "./audit.service";

/**
 * Structured Requirements (blueprint §3.2.4 / §6.2.8). Mirrors DecisionService:
 * constructor-injected repositories, tenant-scoping via requireProject, and
 * Timeline + Audit events on every write.
 *
 * Ownership rule: the AI only PROPOSES (extract). Requirements enter the
 * database exclusively through confirm() — i.e. after explicit human review.
 * Rejected proposals are audited but never persisted.
 */
export class RequirementService {
  private timelineService = new TimelineService();

  constructor(
    private readonly requirementRepository: RequirementRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly projectFileRepository: ProjectFileRepository
  ) {}

  private async requireProject(projectId: string, tenantId: string) {
    const project = await this.projectRepository.findById(projectId, tenantId);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }

  private async requireOwnedRequirement(
    requirementId: string,
    projectId: string
  ): Promise<Requirement> {
    const requirement = await this.requirementRepository.findById(requirementId);
    if (!requirement || requirement.projectId !== projectId) {
      throw new Error("Requirement not found");
    }
    return requirement;
  }

  /** Validate that a source file (if provided) belongs to this project. */
  private async assertFileInProject(sourceFileId: string, projectId: string) {
    const file = await this.projectFileRepository.findById(sourceFileId);
    if (!file || file.projectId !== projectId) {
      throw new Error("Source file not found");
    }
    return file;
  }

  /**
   * PROPOSE requirements from a source (an uploaded brief's text, or the
   * project's memory). Returns review candidates only — nothing is persisted,
   * so no Timeline/Audit event is emitted here.
   */
  async extract(input: {
    projectId: string;
    tenantId: string;
    sourceFileId?: string;
  }): Promise<{ sourceFileId: string | null; requirements: ExtractedRequirementProposal[] }> {
    const project = await this.requireProject(input.projectId, input.tenantId);

    let sourceText: string | undefined;
    let sourceFileId: string | null = null;

    if (input.sourceFileId) {
      const file = await this.assertFileInProject(input.sourceFileId, input.projectId);
      const chunks = await documentChunkRepository.findByFileOrdered(file.id);
      sourceText = chunks.map((chunk) => chunk.content).join("\n");

      if (!sourceText.trim()) {
        throw new Error("Source file has no indexed text yet");
      }

      sourceFileId = file.id;
    }

    const { requirements } = await requirementWorkflow.execute({
      projectId: input.projectId,
      projectName: project.name,
      sourceText,
    });

    // Attach an ephemeral tempId per proposal for the review UI. Never persisted.
    const proposals: ExtractedRequirementProposal[] = requirements.map(
      (requirement) => ({ tempId: randomUUID(), ...requirement })
    );

    return { sourceFileId, requirements: proposals };
  }

  /** List persisted requirements, optionally filtered to the baseline set. */
  async list(projectId: string, tenantId: string, isBaseline?: boolean) {
    await this.requireProject(projectId, tenantId);
    return this.requirementRepository.findByProject(projectId, isBaseline);
  }

  /**
   * CONFIRM (Accept / Edit & Save): the only write path for requirements.
   * Persists a human-reviewed batch atomically, preserving provenance
   * (sourceFileId + sourceExcerpt), then logs Timeline + Audit.
   */
  async confirm(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    requirements: ConfirmRequirementItem[];
  }): Promise<{ accepted: number; createdIds: string[]; requirements: Requirement[] }> {
    await this.requireProject(input.projectId, input.tenantId);

    // Validate provenance: any referenced source file must belong to the project.
    const fileIds = [
      ...new Set(
        input.requirements
          .map((requirement) => requirement.sourceFileId)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    await Promise.all(
      fileIds.map((id) => this.assertFileInProject(id, input.projectId))
    );

    const created = await this.requirementRepository.createConfirmed(
      input.requirements.map((requirement) => ({
        projectId: input.projectId,
        title: requirement.title,
        description: requirement.description ?? null,
        category: requirement.category ?? null,
        sourceExcerpt: requirement.sourceExcerpt ?? null,
        sourceFileId: requirement.sourceFileId ?? null,
      }))
    );

    // Unified retrieval index sync for each newly-persisted requirement (best-effort).
    for (const requirement of created) {
      await searchableIndexService.syncSafe(SearchableSourceType.REQUIREMENT, requirement.id);
    }

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action: "REQUIREMENTS_ACCEPTED",
      description: `Accepted ${created.length} requirement(s)`,
    });

    await Promise.all(
      created.map((requirement) =>
        auditService.createLog({
          tenantId: input.tenantId,
          userId: input.userId,
          projectId: input.projectId,
          action: "REQUIREMENT_ACCEPTED",
          entityType: "REQUIREMENT",
          entityId: requirement.id,
          details: { title: requirement.title, sourceFileId: requirement.sourceFileId },
        })
      )
    );

    return {
      accepted: created.length,
      createdIds: created.map((requirement) => requirement.id),
      requirements: created,
    };
  }

  /** Edit a persisted requirement. */
  async edit(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    requirementId: string;
    data: UpdateRequirementInput;
  }) {
    await this.requireProject(input.projectId, input.tenantId);
    const previous = await this.requireOwnedRequirement(
      input.requirementId,
      input.projectId
    );

    const updated = await this.requirementRepository.update(input.requirementId, input.data);

    // Re-sync the unified retrieval index after the edit (best-effort).
    await searchableIndexService.syncSafe(SearchableSourceType.REQUIREMENT, updated.id);

    // A change to isBaseline is a scope movement (into or out of the Baseline
    // Scope), not a plain content edit — record it as such so the Timeline and
    // Audit trail read clearly.
    const baselineChanged =
      input.data.isBaseline !== undefined &&
      input.data.isBaseline !== previous.isBaseline;

    const action = baselineChanged
      ? updated.isBaseline
        ? "REQUIREMENT_BASELINED"
        : "REQUIREMENT_UNBASELINED"
      : "REQUIREMENT_EDITED";

    const description = baselineChanged
      ? updated.isBaseline
        ? `Added "${updated.title}" to the Baseline Scope`
        : `Moved "${updated.title}" to New Requests`
      : `Edited requirement "${updated.title}"`;

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action,
      description,
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action,
      entityType: "REQUIREMENT",
      entityId: updated.id,
      details: { changes: input.data },
    });

    return updated;
  }

  /**
   * REJECT proposed requirements. Nothing is persisted to the requirements
   * table — but the rejection is recorded on the Timeline and Audit trail so
   * the review decision is not lost.
   */
  async reject(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    requirements: { title: string }[];
  }) {
    await this.requireProject(input.projectId, input.tenantId);

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action: "REQUIREMENTS_REJECTED",
      description: `Rejected ${input.requirements.length} proposed requirement(s)`,
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action: "REQUIREMENTS_REJECTED",
      entityType: "REQUIREMENT",
      details: { rejected: input.requirements.map((requirement) => requirement.title) },
    });

    return { rejected: input.requirements.length };
  }

  /** Delete a persisted requirement. */
  async remove(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    requirementId: string;
  }) {
    await this.requireProject(input.projectId, input.tenantId);
    const requirement = await this.requireOwnedRequirement(
      input.requirementId,
      input.projectId
    );

    await this.requirementRepository.delete(input.requirementId);

    // Drop the requirement from the unified retrieval index (best-effort).
    await searchableIndexService.removeSafe(SearchableSourceType.REQUIREMENT, input.requirementId);

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action: "REQUIREMENT_DELETED",
      description: `Deleted requirement "${requirement.title}"`,
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action: "REQUIREMENT_DELETED",
      entityType: "REQUIREMENT",
      entityId: requirement.id,
      details: { title: requirement.title },
    });

    return { deleted: true };
  }

  /**
   * Set the project's Baseline Scope to exactly the given requirement set
   * (blueprint Scenario A.6). The repository performs this atomically so the
   * baseline is always in a single, consistent state.
   */
  async setBaseline(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    requirementIds: string[];
  }) {
    await this.requireProject(input.projectId, input.tenantId);

    // Every id must belong to this project before we touch the baseline.
    const existing = await this.requirementRepository.findByProject(input.projectId);
    const projectRequirementIds = new Set(existing.map((requirement) => requirement.id));
    for (const id of input.requirementIds) {
      if (!projectRequirementIds.has(id)) {
        throw new Error("Requirement not found");
      }
    }

    await this.requirementRepository.setBaselineTransactional(
      input.projectId,
      input.requirementIds
    );

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action: "BASELINE_SET",
      description: `Set Baseline Scope (${input.requirementIds.length} requirement(s))`,
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action: "BASELINE_SET",
      entityType: "REQUIREMENT",
      details: { requirementIds: input.requirementIds },
    });

    return this.requirementRepository.findByProject(input.projectId, true);
  }
}
