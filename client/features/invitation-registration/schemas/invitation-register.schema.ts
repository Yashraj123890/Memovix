import { z } from "zod";

/**
 * Shared schema for the two token-based, invitation self-registration
 * forms — client (POST /client/register) and member (POST /members/register).
 * Both backend endpoints accept the same body shape ({ token, name,
 * password }; the token comes from the URL, not this form) and neither
 * enforces a minimum password length server-side. The 8-character minimum
 * here matches the app's existing password policy
 * (features/auth/schemas/register.schema.ts) for a consistent client-side
 * UX. `confirmPassword` is a client-only UX field, stripped before the
 * request is built (see the register mutations in
 * features/client-registration and features/member-registration).
 */
export const invitationRegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type InvitationRegisterFormValues = z.infer<
  typeof invitationRegisterSchema
>;
