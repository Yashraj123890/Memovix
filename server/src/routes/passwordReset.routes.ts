import { Router } from "express";
import { PasswordResetController } from "../controllers/passwordReset.controller";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();
const controller = new PasswordResetController();

router.post(
    "/forgot-password",
    authLimiter,
    controller.forgotPassword
);

router.post(
    "/reset-password",
    authLimiter,
    controller.resetPassword
);

export default router;