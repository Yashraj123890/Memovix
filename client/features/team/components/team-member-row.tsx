"use client";

import { useState } from "react";
import { UserMinusIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, ROLE_BADGE_VARIANT } from "@/features/team/config/role";
import { getInitials } from "@/features/team/utils/get-initials";
import { formatRelativeTime } from "@/utils/format-relative-time";
import { RemoveMemberDialog } from "@/features/team/components/remove-member-dialog";
import type { ProjectMember } from "@/types/team";

interface TeamMemberRowProps {
  member: ProjectMember;
  projectId: string;
}

/**
 * Remove is always available here — the backend's project-member routes
 * only require authentication, no role check, so the frontend doesn't
 * invent a restriction the API doesn't enforce. The trailing w-8 wrapper
 * reserves the actions column so future additions (Change Role, View
 * Profile, Presence Indicator) can drop in without reflowing
 * name/email/role/date for every row.
 */
export function TeamMemberRow({ member, projectId }: TeamMemberRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <Avatar fallback={getInitials(member.user.name)} alt={member.user.name} />

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{member.user.name}</p>
        <p className="text-muted-foreground truncate text-xs">{member.user.email}</p>
      </div>

      <Badge variant={ROLE_BADGE_VARIANT[member.role]} className="shrink-0">
        {ROLE_LABEL[member.role]}
      </Badge>

      <span className="text-muted-foreground hidden w-28 shrink-0 text-right text-xs sm:inline">
        Joined {formatRelativeTime(member.joinedAt)}
      </span>

      <div className="flex w-8 shrink-0 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive size-8"
          onClick={() => setConfirmOpen(true)}
          aria-label={`Remove ${member.user.name}`}
        >
          <UserMinusIcon className="size-4" aria-hidden="true" />
        </Button>
        <RemoveMemberDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          projectId={projectId}
          member={member}
        />
      </div>
    </li>
  );
}
