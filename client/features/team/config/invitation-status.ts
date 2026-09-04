import type { InvitationStatus } from "@/types/team";

/**
 * "Active Member" (not "Accepted") for the ACCEPTED state — once accepted,
 * the invitee is a real workspace member (see MemberInvitation doc comment
 * in types/team.ts); the copy reflects that outcome, not the raw enum
 * value.
 */
export const INVITATION_STATUS_LABEL: Record<InvitationStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Active Member",
  EXPIRED: "Expired",
};

export const INVITATION_STATUS_BADGE_VARIANT: Record<
  InvitationStatus,
  "outline" | "success" | "secondary"
> = {
  PENDING: "outline",
  ACCEPTED: "success",
  EXPIRED: "secondary",
};
