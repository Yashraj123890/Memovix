import { Router } from "express";
import { UserRole } from "@prisma/client";

import {
    register,
    login,
    refresh,
    logout,
    getCurrentUser,
    getWorkspaces,
    switchWorkspace,
    adminOnly,
    memberOnly,
} from "../controllers/auth.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Cookie-based (no access token required): rotate the refresh token / revoke it.
// Not behind authLimiter — refresh runs on the normal ~15-minute access cadence.
router.post("/refresh", refresh);
router.post("/logout", logout);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    authenticate,
    getCurrentUser
);

// M11 — client multi-workspace. Both require a valid access token.
router.get(
    "/workspaces",
    authenticate,
    getWorkspaces
);

router.post(
    "/switch-workspace",
    authenticate,
    switchWorkspace
);

router.get(
    "/admin",
    authenticate,
    authorize(UserRole.OWNER),
    adminOnly
);

router.get(
    "/member",
    authenticate,
    authorize(
        UserRole.OWNER,
        UserRole.MEMBER
    ),
    memberOnly
);

export default router;