import { Request, Response, NextFunction } from "express";
import auditService from "../services/audit.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class AuditController {

    async getProjectLogs(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) {
        try {

             const projectId = req.params.projectId as string;

            const logs =
                await auditService.getProjectLogs(projectId);

            res.status(200).json({
                success: true,
                message: "Audit logs fetched successfully.",
                data: logs,
            });

        } catch (error) {
            next(error);
        }
    }

    async getTenantLogs(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) {
        try {

            const tenantId = req.user!.tenantId;

            const logs =
                await auditService.getTenantLogs(tenantId);

            res.status(200).json({
                success: true,
                message: "Tenant audit logs fetched successfully.",
                data: logs,
            });

        } catch (error) {
            next(error);
        }
    }

}

export default new AuditController();