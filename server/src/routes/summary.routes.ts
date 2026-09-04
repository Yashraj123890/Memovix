import { Router } from "express";
import summaryController from "../controllers/summary.controller";
import { authenticate } from "../middleware/auth.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";

const router = Router();

router.post(
    "/summary",
    authenticate,
    checkProjectAccess,
    summaryController.generate
);

export default router;