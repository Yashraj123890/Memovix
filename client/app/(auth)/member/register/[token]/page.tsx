"use client";

import { useParams } from "next/navigation";
import { Users } from "lucide-react";
import { InvitationRegisterCard } from "@/features/invitation-registration/components/invitation-register-card";
import { useMemberRegisterMutation } from "@/features/member-registration/hooks/use-member-register-mutation";

/**
 * "/member/register/:token" — the link
 * server/src/services/member.service.ts inviteMember puts in the workspace
 * member invitation email (`${env.FRONTEND_URL}/member/register/${token}`).
 * Direct counterpart of /client/register/:token: same (auth) route group
 * chrome, same shared InvitationRegisterCard, differing only in the mutation
 * (POST /members/register) and the role-specific copy/icon passed as props.
 *
 * Deliberately NOT wrapped in RequireGuest (unlike /login and /register):
 * this is a token-driven account-creation page, not a guest-only page. An
 * owner is usually still signed in in the same browser when they open the
 * invite link, and RequireGuest would bounce them to the dashboard before
 * the form ever rendered. The existing session is simply ignored until
 * registration completes, at which point the mutation's setSession replaces
 * it with the new member account. See use-member-register-mutation.ts.
 */
export default function MemberRegisterPage() {
  const { token } = useParams<{ token: string }>();
  const mutation = useMemberRegisterMutation();

  return (
    <InvitationRegisterCard
      icon={Users}
      title="Join Memovix as a Team Member"
      subtitle="You've been invited to collaborate on this workspace."
      token={token}
      mutation={mutation}
      idPrefix="member"
      submitLabel="Join workspace"
    />
  );
}
