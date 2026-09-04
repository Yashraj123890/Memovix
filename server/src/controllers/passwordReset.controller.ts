import { Request, Response } from "express";
import { PasswordResetService, PasswordResetError } from "../services/passwordReset.service";

const passwordResetService = new PasswordResetService();

export class PasswordResetController {

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;

            const result = await passwordResetService.forgotPassword(email);

            return res.status(200).json(result);
        } catch (error) {
            // Never reveal internals or whether the account exists — log the
            // real cause server-side, return the same generic message.
            console.error("[passwordReset] forgotPassword failed:", error);
            return res.status(200).json({
                message:
                    "If an account with that email exists, a password reset link has been sent.",
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token, password } = req.body;

            const result = await passwordResetService.resetPassword(token, password);

            return res.status(200).json(result);
        } catch (error) {
            // Known, safe-to-show validation errors (bad/expired/used token,
            // weak password) → 400 with their message.
            if (error instanceof PasswordResetError) {
                return res.status(400).json({ success: false, message: error.message });
            }

            // Anything else is internal (DB/RLS/etc.): log it, return a clean
            // generic message so no stack trace ever reaches the user.
            console.error("[passwordReset] resetPassword failed:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to reset your password. Please try again.",
            });
        }
    }
}
