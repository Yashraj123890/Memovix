import { z } from "zod";

/**
 * POST /api/members/invite only accepts { email } — no name, no role
 * (MemberInvitation has no name column in server/prisma/schema.prisma, and
 * the invited user is always created with role MEMBER on acceptance, see
 * server/src/repositories/auth.repository.ts createMember). So this schema
 * — and the modal built from it — only asks for what the backend can
 * actually persist.
 */
export const inviteMemberSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
