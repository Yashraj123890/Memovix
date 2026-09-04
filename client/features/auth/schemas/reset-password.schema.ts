import { z } from "zod";

/**
 * New-password form. Mirrors the backend's minimum (login/register use 8+
 * chars) and adds a client-side confirm-match check; the server remains the
 * source of truth for token validity.
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
