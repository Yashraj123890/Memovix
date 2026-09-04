import { z } from "zod";

/**
 * POST /projects/:projectId/invite-client only accepts { email } — same
 * shape as the workspace invite-member schema (features/team/schemas/
 * invite-member.schema.ts). No name/role field: the client's name is
 * captured when they register from the invitation, and role is implicitly
 * CLIENT server-side.
 */
export const inviteClientSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export type InviteClientFormValues = z.infer<typeof inviteClientSchema>;
