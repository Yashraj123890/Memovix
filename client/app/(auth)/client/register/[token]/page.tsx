"use client";

import { useParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import { InvitationRegisterCard } from "@/features/invitation-registration/components/invitation-register-card";
import { useClientRegisterMutation } from "@/features/client-registration/hooks/use-client-register-mutation";

/**
 * "/client/register/:token" — the link
 * server/src/services/clientInvitation.service.ts inviteClient puts in the
 * client invitation email (`${env.FRONTEND_URL}/client/register/${token}`).
 * Reuses the (auth) route group's shared AuthLayout chrome and the same
 * shared InvitationRegisterCard as /member/register/:token, differing only in
 * the mutation (POST /client/register) and the role-specific copy/icon.
 *
 * Deliberately NOT wrapped in RequireGuest (unlike /login and /register):
 * this is a token-driven account-creation page, not a guest-only page. The
 * owner is usually still signed in in the same browser when the invite link
 * is opened, and RequireGuest would bounce them to the dashboard before the
 * form ever rendered. The existing session is ignored until registration
 * completes, at which point the mutation's setSession replaces it with the
 * new client account. Mirrors /member/register/:token.
 */
export default function ClientRegisterPage() {
  const { token } = useParams<{ token: string }>();
  const mutation = useClientRegisterMutation();

  return (
    <InvitationRegisterCard
      icon={Briefcase}
      title="Join Memovix as a Client"
      subtitle="You've been invited to access your project."
      token={token}
      mutation={mutation}
      idPrefix="client"
      submitLabel="Access my project"
    />
  );
}
