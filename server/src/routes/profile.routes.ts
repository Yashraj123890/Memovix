import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { uploadLimiter } from "../middleware/rateLimit.middleware";
import { avatarUpload, validateAvatarSignature } from "../middleware/avatarUpload.middleware";
import { updateProfileSchema } from "../validators/profile.validator";
import {
    getMyProfile,
    updateMyProfile,
    uploadMyAvatar,
} from "../controllers/profile.controller";

const router = Router();

/**
 * Self-service profile for any authenticated user (OWNER / MEMBER / CLIENT).
 * Every route acts on req.user.userId — there is no `:userId` param, so a user
 * can only ever read or modify their OWN profile (RBAC + tenant isolation are
 * inherent). Avatar upload reuses the file-security pattern from
 * project-file.routes (rate limit -> multer -> magic-byte check).
 */
router.get("/me/profile", authenticate, getMyProfile);

router.patch("/me/profile", authenticate, validate(updateProfileSchema), updateMyProfile);

router.post(
    "/me/avatar",
    authenticate,
    uploadLimiter,
    avatarUpload.single("file"),
    validateAvatarSignature,
    uploadMyAvatar
);

export default router;
