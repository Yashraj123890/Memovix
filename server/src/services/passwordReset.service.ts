import crypto from "crypto";

import { PasswordResetRepository } from "../repositories/passwordReset.repository";
import { AuthRepository } from "../repositories/auth.repository";

import { EmailService } from "./email/email.service";
import { env } from "../config/env";
import { hashPassword } from "../auth/password";
import auditService from "./audit.service";
import notificationService from "./notification.service";
import { NotificationType } from "@prisma/client";
import { runWithTenantContext } from "../lib/tenant-context";

const passwordResetRepository = new PasswordResetRepository();
const authRepository = new AuthRepository();
const emailService = new EmailService();

/**
 * User-facing password-reset errors (invalid/expired/used token, weak
 * password). These messages are safe to show; the controller returns them as a
 * 400. Any OTHER thrown error is treated as internal and never surfaced.
 */
export class PasswordResetError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PasswordResetError";
    }
}

export class PasswordResetService {

    async forgotPassword(email: string) {

    const user = await authRepository.findUserByEmail(email);
    await passwordResetRepository.deleteExpired();

    // Don't reveal whether the email exists
    if (!user) {
        return {
            message: "If an account with that email exists, a password reset link has been sent.",
        };
    }

    // Invalidate previous unused tokens
    await passwordResetRepository.invalidateUserTokens(user.id);

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save token
    await passwordResetRepository.create({
        token,
        userId: user.id,
        expiresAt,
    });

    // Build reset link
    const resetLink = `${env.FRONTEND_URL}/reset-password/${token}`;

    // Send email
    await emailService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetLink,
    });

    return {
        message: "If an account with that email exists, a password reset link has been sent.",
    };
}

    async resetPassword(
    token: string,
    password: string
) {

    const resetToken =
        await passwordResetRepository.findByToken(token);

    if (!resetToken) {
        throw new PasswordResetError("Invalid password reset token.");
    }

    if (resetToken.used) {
        throw new PasswordResetError("This password reset link has already been used.");
    }

    if (new Date() > resetToken.expiresAt) {
        throw new PasswordResetError("Password reset link has expired.");
    }

    // Enforce the same minimum as register/login server-side — never trust the
    // client alone (the reset route has no body validator).
    if (typeof password !== "string" || password.length < 8) {
        throw new PasswordResetError("Password must be at least 8 characters.");
    }

    const passwordHash = await hashPassword(password);

    // Password reset is token-authenticated, so no JWT/session and no tenant
    // context is bound. Bind the reset token's VERIFIED owner tenant (never a
    // fabricated/hardcoded id) so the strict RLS tables (AuditLog, Notification)
    // accept these writes — the same mechanism bindTenantContext uses for an
    // authenticated request. Writes stay RLS-scoped; nothing is disabled.
    await runWithTenantContext(
        { tenantId: resetToken.user.tenantId },
        async () => {
            await authRepository.updatePassword(resetToken.userId, passwordHash);
            await passwordResetRepository.markUsed(resetToken.id);

            await auditService.createLog({
                tenantId: resetToken.user.tenantId,
                userId: resetToken.user.id,
                action: "PASSWORD_RESET",
                entityType: "USER",
                entityId: resetToken.user.id,
                details: {
                    email: resetToken.user.email,
                },
            });

            await notificationService.createNotification({
                userId: resetToken.user.id,
                type: NotificationType.SYSTEM,
                title: "Password Changed",
                message: "Your password has been changed successfully.",
            });
        }
    );

    return {
        message: "Password reset successfully.",
    };
}

}