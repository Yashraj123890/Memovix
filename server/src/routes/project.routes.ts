import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";

import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from "../controllers/project.controller";

const router = Router();

// Create Project
router.post(
    "/",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    createProject
);

// Get All Projects
router.get(
    "/",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER, UserRole.CLIENT),
    getProjects
);

// Get Single Project
router.get(
    "/:id",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER, UserRole.CLIENT),
    checkProjectAccess,
    getProjectById
);

// Update Project
router.put(
    "/:id",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    updateProject
);

// Delete Project
router.delete(
    "/:id",
    authenticate,
    authorize(UserRole.OWNER),
    deleteProject
);

export default router;