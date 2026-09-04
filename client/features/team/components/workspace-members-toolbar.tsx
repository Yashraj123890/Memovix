"use client";

import { MailPlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RoleFilter } from "@/features/team/components/role-filter";
import type { TeamRole } from "@/types/team";

interface WorkspaceMembersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: TeamRole | "ALL";
  onRoleChange: (value: TeamRole | "ALL") => void;
  /** Only OWNER can invite server-side (authorize("OWNER") on POST /members/invite) — omitted entirely for others. */
  onInviteMember?: () => void;
}

export function WorkspaceMembersToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  onInviteMember,
}: WorkspaceMembersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search members..."
            className="pl-9"
            aria-label="Search workspace members"
          />
        </div>

        <RoleFilter value={role} onChange={onRoleChange} />
      </div>

      {onInviteMember && (
        <Button type="button" size="sm" onClick={onInviteMember} className="gap-1.5">
          <MailPlusIcon className="size-3.5" aria-hidden="true" />
          Invite member
        </Button>
      )}
    </div>
  );
}
