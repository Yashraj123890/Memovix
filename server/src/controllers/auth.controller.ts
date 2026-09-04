import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { sessionService } from "../services/session.service";
import { setRefreshCookie, clearRefreshCookie } from "../auth/cookies";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { env } from "../config/env";

const authService = new AuthService();

export async function register(req: Request, res: Response) {
    try {
        const { refreshToken, ...data } = await authService.register(req.body);

        setRefreshCookie(res, refreshToken);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { refreshToken, ...data } = await authService.login(req.body);

        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data,
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
}

/**
 * POST /api/auth/refresh — silent session refresh. Reads the HttpOnly refresh
 * cookie, rotates it, and returns a new access token. On any failure the cookie
 * is cleared and 401 is returned so the client falls back to login.
 */
export async function refresh(req: Request, res: Response) {
    try {
        const { session, user } = await sessionService.refresh(
            req.cookies?.[env.REFRESH_COOKIE_NAME],
        );

        setRefreshCookie(res, session.refreshToken);

        return res.status(200).json({
            success: true,
            message: "Session refreshed",
            data: { accessToken: session.accessToken, user },
        });
    } catch (error: any) {
        clearRefreshCookie(res);
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
}

/**
 * POST /api/auth/logout — revoke the refresh token server-side and clear the
 * cookie. Idempotent: always succeeds from the client's perspective.
 */
export async function logout(req: Request, res: Response) {
    await sessionService.logout(req.cookies?.[env.REFRESH_COOKIE_NAME]);
    clearRefreshCookie(res);

    return res.status(200).json({
        success: true,
        message: "Logged out",
    });
}

/**
 * GET /api/auth/me
 */
export function getCurrentUser(
    req: AuthenticatedRequest,
    res: Response
) {
    return res.status(200).json({
        success: true,
        message: "Authenticated user",
        data: req.user,
    });
}

/**
 * GET /api/auth/workspaces — the accessible workspaces for the authenticated
 * user ({ tenantId, name, role } only). For clients this is the multi-workspace
 * picker source; owners/members get their single workspace. (M11)
 */
export async function getWorkspaces(
    req: AuthenticatedRequest,
    res: Response
) {
    const data = await sessionService.listWorkspaces(req.user!.userId);
    return res.status(200).json({ success: true, data });
}

/**
 * POST /api/auth/switch-workspace — change the current session's active
 * workspace (clients only). Returns a new access token scoped to the target.
 * (M11)
 */
export async function switchWorkspace(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const tenantId = req.body?.tenantId;
        if (!tenantId || typeof tenantId !== "string") {
            return res.status(400).json({ success: false, message: "tenantId is required" });
        }

        const result = await sessionService.switchWorkspace(
            req.user!.userId,
            tenantId,
            req.cookies?.[env.REFRESH_COOKIE_NAME]
        );

        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(403).json({ success: false, message: error.message });
    }
}

/**
 * GET /api/auth/admin
 */
export function adminOnly(
    req: AuthenticatedRequest,
    res: Response
) {
    return res.status(200).json({
        success: true,
        message: "Welcome OWNER",
        data: req.user,
    });
}

/**
 * GET /api/auth/member
 */
export function memberOnly(
    req: AuthenticatedRequest,
    res: Response
) {
    return res.status(200).json({
        success: true,
        message: "Welcome OWNER or MEMBER",
        data: req.user,
    });
}