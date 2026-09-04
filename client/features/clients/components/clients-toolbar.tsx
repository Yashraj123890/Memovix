"use client";

import { MailPlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClientsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  /** Only OWNER can invite server-side (authorize(UserRole.OWNER) on invite-client) — omitted entirely for others. */
  onInviteClient?: () => void;
}

export function ClientsToolbar({ search, onSearchChange, onInviteClient }: ClientsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search clients..."
          className="pl-9"
          aria-label="Search clients"
        />
      </div>

      {onInviteClient && (
        <Button type="button" size="sm" onClick={onInviteClient} className="gap-1.5">
          <MailPlusIcon className="size-3.5" aria-hidden="true" />
          Invite client
        </Button>
      )}
    </div>
  );
}
