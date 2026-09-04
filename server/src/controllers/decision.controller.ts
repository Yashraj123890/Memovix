import { Response } from "express";
import { DecisionCategory } from "@prisma/client";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { DecisionService } from "../services/decision.service";
import { DecisionRepository } from "../repositories/decision.repository";
import { ProjectRepository } from "../repositories/project.repository";

const decisionService = new DecisionService(
    new DecisionRepository(),
    new ProjectRepository()
);

const VALID_CATEGORIES = Object.values(DecisionCategory);

function handleError(res: Response, error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    const status = /not found/i.test(message) ? 404 : 400;
    return res.status(status).json({ success: false, message });
}

export async function listDecisions(req: AuthenticatedRequest, res: Response) {
    try {
        const projectId = String(req.params.projectId);

        // Optional ?category= filter — ignore anything that isn't a valid enum value.
        const raw = typeof req.query.category === "string" ? req.query.category : undefined;
        const category =
            raw && VALID_CATEGORIES.includes(raw as DecisionCategory)
                ? (raw as DecisionCategory)
                : undefined;

        const decisions = await decisionService.listDecisions(
            projectId,
            req.user!.tenantId,
            category
        );

        return res.status(200).json({ success: true, data: decisions });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function createDecision(req: AuthenticatedRequest, res: Response) {
    try {
        const projectId = String(req.params.projectId);
        const { category, customCategory, description } = req.body;

        const decision = await decisionService.createManualDecision({
            projectId,
            tenantId: req.user!.tenantId,
            loggedById: req.user!.userId,
            category,
            customCategory,
            description,
        });

        return res.status(201).json({ success: true, data: decision });
    } catch (error) {
        return handleError(res, error);
    }
}
