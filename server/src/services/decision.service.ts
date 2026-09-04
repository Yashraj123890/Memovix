import { DecisionCategory, DecisionSourceType, SearchableSourceType } from "@prisma/client";

import { DecisionRepository } from "../repositories/decision.repository";
import { ProjectRepository } from "../repositories/project.repository";

import { TimelineService } from "./timeline.service";
import searchableIndexService from "./searchableIndex.service";
import auditService from "./audit.service";

/**
 * Decision Log (blueprint §3.2.9). Mirrors DeliverableService: constructor-
 * injected repositories, tenant-scoping via requireProject, Timeline + audit
 * events on writes. Phase 2 implements only manual entries (source MANUAL);
 * the APPROVAL-sourced auto-entry is written by the Approval Workflow in a
 * later phase, reusing DecisionRepository.create directly.
 */
export class DecisionService {
    private timelineService = new TimelineService();

    constructor(
        private readonly decisionRepository: DecisionRepository,
        private readonly projectRepository: ProjectRepository
    ) {}

    private async requireProject(projectId: string, tenantId: string) {
        const project = await this.projectRepository.findById(projectId, tenantId);
        if (!project) {
            throw new Error("Project not found");
        }
        return project;
    }

    async listDecisions(projectId: string, tenantId: string, category?: DecisionCategory) {
        await this.requireProject(projectId, tenantId);
        return this.decisionRepository.findByProject(projectId, category);
    }

    async createManualDecision(input: {
        projectId: string;
        tenantId: string;
        loggedById: string;
        category: DecisionCategory;
        customCategory?: string;
        description: string;
    }) {
        await this.requireProject(input.projectId, input.tenantId);

        const customCategory = input.customCategory?.trim() || null;
        if (input.category === DecisionCategory.OTHER && !customCategory) {
            throw new Error("Custom category is required");
        }

        const decision = await this.decisionRepository.create({
            category: input.category,
            customCategory:
                input.category === DecisionCategory.OTHER ? customCategory : null,
            description: input.description,
            sourceType: DecisionSourceType.MANUAL,
            project: { connect: { id: input.projectId } },
            loggedBy: { connect: { id: input.loggedById } },
        });

        // Unified retrieval index sync (best-effort — never fails the write).
        await searchableIndexService.syncSafe(SearchableSourceType.DECISION, decision.id);

        await this.timelineService.createEvent({
            projectId: input.projectId,
            userId: input.loggedById,
            action: "DECISION_LOGGED",
            description: `Logged a ${(customCategory ?? input.category).toLowerCase()} decision`,
        });

        await auditService.createLog({
            tenantId: input.tenantId,
            userId: input.loggedById,
            projectId: input.projectId,
            action: "DECISION_LOGGED",
            entityType: "DECISION_LOG",
            entityId: decision.id,
            details: { category: customCategory ?? input.category },
        });

        return decision;
    }
}
