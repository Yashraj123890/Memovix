import { z } from "zod";

/**
 * Mirrors server/src/validators/auth.validator.ts `registerSchema` so a
 * client never submits something the backend would reject anyway. The
 * `confirmPassword` field is a client-only UX addition (the backend contract
 * has no such field) — it's stripped out before the request payload is
 * built in useRegister, never sent to POST /auth/register.
 */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
