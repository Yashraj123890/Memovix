import { Router } from "express";

import projectMemberController from "../controllers/projectMember.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate );

router.get(
  "/projects/:projectId/members",
  projectMemberController.getProjectMembers
);

router.post(
  "/projects/:projectId/members",
  projectMemberController.addMember
);

router.delete(
  "/projects/:projectId/members/:userId",
  projectMemberController.removeMember
);

export default router;