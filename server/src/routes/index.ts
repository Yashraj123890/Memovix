import { Router } from "express";

import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import projectRoutes from "./project.routes";
import clientInvitationRoutes from "./clientInvitation.routes";
import projectFileRoutes from "./project-file.routes";
import passwordResetRoutes from "./passwordReset.routes";
import profileRoutes from "./profile.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/", clientInvitationRoutes);
router.use("/files", projectFileRoutes);
router.use(
    "/auth",
    passwordResetRoutes
);
router.use("/users", profileRoutes);

export default router;