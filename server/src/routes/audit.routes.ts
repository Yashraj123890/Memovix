import { Router } from "express";

import auditController from "../controllers/audit.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
    "/tenant",
    auditController.getTenantLogs
);

router.get(
    "/project/:projectId",
    auditController.getProjectLogs
);

export default router;