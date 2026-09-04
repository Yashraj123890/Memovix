import { z } from "zod";

/**
 * Body schema shared by the two invite endpoints — POST /members/invite and
 * POST /projects/:projectId/invite-client — both of which accept only
 * { email }. Trims and validates email format so malformed addresses are
 * rejected before the invitation/email pipeline runs.
 */
export const inviteEmailSchema = z.object({
  email: z.string().trim().email("A valid email address is required"),
});

export type InviteEmailInput = z.infer<typeof inviteEmailSchema>;
