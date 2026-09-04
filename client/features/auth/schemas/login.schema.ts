import { z } from "zod";

/**
 * Mirrors server/src/validators/auth.validator.ts `loginSchema` so a client
 * never submits something the backend would reject anyway.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
