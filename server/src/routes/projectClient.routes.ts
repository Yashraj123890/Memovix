import { Router } from "express";



import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

import { UserRole } from "@prisma/client";
import {
    getClientProjects,
    getClientProject,
    getProjectClients,
    removeProjectClient,
} from "../controllers/projectClient.controller";

const router = Router();

router.get(
    "/client/projects",
    authenticate,
    authorize(UserRole.CLIENT),
    getClientProjects
);

router.get(
    "/client/projects/:projectId",
    authenticate,
    authorize(UserRole.CLIENT),
    getClientProject
);
router.get(
    "/projects/:projectId/clients",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    getProjectClients
);

router.delete(
    "/projects/:projectId/clients/:clientId",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    removeProjectClient
);
export default router;