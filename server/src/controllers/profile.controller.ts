import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ProfileService } from "../services/profile.service";
import { AVATAR_EXTENSION } from "../middleware/avatarUpload.middleware";

const profileService = new ProfileService();

function handleError(res: Response, error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    const status = /not found/i.test(message) ? 404 : 400;
    return res.status(status).json({ success: false, message });
}

/** GET /users/me/profile — the signed-in user's own profile. */
export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
    try {
        const profile = await profileService.getProfile(req.user!.userId);
        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return handleError(res, error);
    }
}

/** PATCH /users/me/profile — update the caller's own title/about. */
export async function updateMyProfile(req: AuthenticatedRequest, res: Response) {
    try {
        const { title, about } = req.body as { title?: string | null; about?: string | null };
        const profile = await profileService.updateProfile(req.user!.userId, { title, about });
        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return handleError(res, error);
    }
}

/** POST /users/me/avatar — upload/replace the caller's own profile photo. */
export async function uploadMyAvatar(req: AuthenticatedRequest, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const extension = AVATAR_EXTENSION[req.file.mimetype] ?? "img";
        const profile = await profileService.updateAvatar(
            req.user!.userId,
            { buffer: req.file.buffer, mimeType: req.file.mimetype },
            extension
        );

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return handleError(res, error);
    }
}
