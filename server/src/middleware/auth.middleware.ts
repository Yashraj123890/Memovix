import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { verifyAccessToken } from "../auth/jwt";
import { runWithTenantContext } from "../lib/tenant-context";

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        tenantId: string;
        role: UserRole;
    };
}

export function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing",
            });
        }

        const token = authHeader.split(" ")[1];

        const payload = verifyAccessToken(token);

        req.user = {
            userId: payload.userId,
            tenantId: payload.tenantId,
            role: payload.role,
        };

        // Bind the tenant context for the remainder of this request so the
        // Prisma extension can scope every query to this tenant (RLS, M9 P3).
        return runWithTenantContext({ tenantId: payload.tenantId }, () =>
            next()
        );
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
/**
 * Re-establish the tenant context after multipart parsing.
 *
 * multer parses the upload stream via socket 'data' events whose callbacks run
 * outside the AsyncLocalStorage scope that `authenticate` set, so the tenant
 * context is lost by the time the controller runs — which makes RLS see no
 * context and return 0 rows ("Project not found"). Placing this AFTER
 * `upload.single(...)` rebinds the context from the already-verified req.user
 * for the rest of the chain. (M9 Phase 3 — required on file-upload routes only.)
 */
export function bindTenantContext(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    if (req.user?.tenantId) {
        return runWithTenantContext({ tenantId: req.user.tenantId }, () =>
            next()
        );
    }
    return next();
}

export function authorize(...roles: UserRole[]) {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        next();
    };
}