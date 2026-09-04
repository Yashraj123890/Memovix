import { Router } from "express";
import { TimelineController } from "../controllers/timeline.controller";
import { authenticate } from "../middleware/auth.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";

const router = Router();

const timelineController = new TimelineController();

router.get(
    "/projects/:projectId/timeline",
    authenticate,
    checkProjectAccess,
    timelineController.getProjectTimeline.bind(timelineController)
);

export default router;