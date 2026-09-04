import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, ROLE_BADGE_VARIANT } from "@/features/team/config/role";
import { getInitials } from "@/features/team/utils/get-initials";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { WorkspaceMember } from "@/types/team";

interface WorkspaceMemberRowProps {
  member: WorkspaceMember;
}

/**
 * Read-only — there is no backend endpoint to remove/deactivate a
 * workspace member (member.routes.ts only exposes invite/list-invitations/
 * cancel-invitation/list-members, nothing to delete a User), so unlike
 * TeamMemberRow (which removes a *project* membership) this row has no
 * trailing action column at all.
 */
export function WorkspaceMemberRow({ member }: WorkspaceMemberRowProps) {
  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <Avatar fallback={getInitials(member.name)} alt={member.name} />

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{member.name}</p>
        <p className="text-muted-foreground truncate text-xs">{member.email}</p>
      </div>

      <Badge variant={ROLE_BADGE_VARIANT[member.role]} className="shrink-0">
        {ROLE_LABEL[member.role]}
      </Badge>

      <span className="text-muted-foreground hidden w-32 shrink-0 text-right text-xs sm:inline">
        Joined {formatRelativeTime(member.createdAt)}
      </span>
    </li>
  );
}
