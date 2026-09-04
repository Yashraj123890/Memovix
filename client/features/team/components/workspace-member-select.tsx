"use client";

import { ChevronDownIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import type { WorkspaceMember } from "@/types/team";

interface WorkspaceMemberSelectProps {
  members: WorkspaceMember[];
  isLoading: boolean;
  selected: WorkspaceMember | null;
  onSelect: (member: WorkspaceMember) => void;
}

/** The "workspace member dropdown" used inside AddMemberModal. */
export function WorkspaceMemberSelect({
  members,
  isLoading,
  selected,
  onSelect,
}: WorkspaceMemberSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between font-normal">
          <span className="flex min-w-0 items-center gap-2">
            <UserIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{selected ? selected.name : "Select a workspace member"}</span>
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-64 w-72 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : members.length === 0 ? (
          <DropdownMenuLabel className="text-muted-foreground font-normal">
            Everyone in the workspace is already on this project
          </DropdownMenuLabel>
        ) : (
          members.map((member) => (
            <DropdownMenuItem key={member.id} onSelect={() => onSelect(member)}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{member.name}</span>
                <span className="text-muted-foreground truncate text-xs">{member.email}</span>
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
