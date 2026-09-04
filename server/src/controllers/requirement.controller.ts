import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { RequirementService } from "../services/requirement.service";
import { RequirementRepository } from "../repositories/requirement.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectFileRepository } from "../repositories/project-file.repository";
import { handleAiError } from "./ai-error.helper";

const requirementService = new RequirementService(
  new RequirementRepository(),
  new ProjectRepository(),
  new ProjectFileRepository()
);

// Extraction invokes the LLM, so AI-provider failures degrade to a clean 503
// via the shared helper (blueprint §4.4); non-AI errors keep the 404/400 mapping.
function handleError(res: Response, error: unknown) {
  return handleAiError(res, error);
}

/** POST /api/ai/requirements/extract — AI proposes requirements (no persistence). */
export async function extractRequirements(req: AuthenticatedRequest, res: Response) {
  try {
    const { projectId, sourceFileId } = req.body;

    const result = await requirementService.extract({
      projectId,
      tenantId: req.user!.tenantId,
      sourceFileId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
}

/** GET /api/projects/:projectId/requirements[?baseline=true] */
export async function listRequirements(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);

    const raw = typeof req.query.baseline === "string" ? req.query.baseline : undefined;
    const isBaseline = raw === "true" ? true : raw === "false" ? false : undefined;

    const requirements = await requirementService.list(
      projectId,
      req.user!.tenantId,
      isBaseline
    );

    return res.status(200).json({ success: true, data: requirements });
  } catch (error) {
    return handleError(res, error);
  }
}

/** POST /api/projects/:projectId/requirements — confirm (Accept / Edit & Save). */
export async function confirmRequirements(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);

    const summary = await requirementService.confirm({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      requirements: req.body.requirements,
    });

    return res.status(201).json({ success: true, data: summary });
  } catch (error) {
    return handleError(res, error);
  }
}

/** PATCH /api/projects/:projectId/requirements/:requirementId */
export async function updateRequirement(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);
    const requirementId = String(req.params.requirementId);

    const updated = await requirementService.edit({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      requirementId,
      data: req.body,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return handleError(res, error);
  }
}

/** POST /api/projects/:projectId/requirements/reject — audit a rejection (no persistence). */
export async function rejectRequirements(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);

    const result = await requirementService.reject({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      requirements: req.body.requirements,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
}

/** DELETE /api/projects/:projectId/requirements/:requirementId */
export async function deleteRequirement(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);
    const requirementId = String(req.params.requirementId);

    const result = await requirementService.remove({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      requirementId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
}

/** POST /api/projects/:projectId/requirements/baseline — set Baseline Scope. */
export async function setBaseline(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);

    const baseline = await requirementService.setBaseline({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      requirementIds: req.body.requirementIds,
    });

    return res.status(200).json({ success: true, data: baseline });
  } catch (error) {
    return handleError(res, error);
  }
}
