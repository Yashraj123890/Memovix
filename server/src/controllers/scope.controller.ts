import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ScopeService } from "../services/scope.service";
import { RequirementRepository } from "../repositories/requirement.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { ScopeFlagRepository } from "../repositories/scopeFlag.repository";
import { ScopeConfig } from "../config/scope.config";
import { handleAiError } from "./ai-error.helper";

const scopeService = new ScopeService(
  new RequirementRepository(),
  new ProjectRepository(),
  new ScopeFlagRepository()
);

// compareBaseline invokes the LLM, so AI-provider failures degrade to a clean
// 503 via the shared helper (blueprint §4.4); non-AI errors keep 404/400.
function handleError(res: Response, error: unknown) {
  return handleAiError(res, error);
}

/** POST /api/projects/:projectId/requirements/compare-baseline — run the pipeline. */
export async function compareBaseline(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);

    const result = await scopeService.runComparison({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
}

/** GET /api/projects/:projectId/scope-flags[?resolution=pending] */
export async function listScopeFlags(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);

    const raw = typeof req.query.resolution === "string" ? req.query.resolution : undefined;
    const resolution =
      raw && (ScopeConfig.resolutions as readonly string[]).includes(raw) ? raw : undefined;

    const flags = await scopeService.listFlags(projectId, req.user!.tenantId, resolution);

    return res.status(200).json({ success: true, data: flags });
  } catch (error) {
    return handleError(res, error);
  }
}

/** POST /api/projects/:projectId/scope-flags/:flagId/resolve — action a flag. */
export async function resolveScopeFlag(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);
    const flagId = String(req.params.flagId);

    const result = await scopeService.resolveFlag({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      flagId,
      action: req.body.action,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
}
