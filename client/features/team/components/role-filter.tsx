"use client";

import { ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_FILTER_OPTIONS } from "@/features/team/config/role";
import type { TeamRole } from "@/types/team";

interface RoleFilterProps {
  value: TeamRole | "ALL";
  onChange: (value: TeamRole | "ALL") => void;
}

/** Same DropdownMenu + RadioGroup pattern as Memories' category filter (F8) and Files' type filter (F9). */
export function RoleFilter({ value, onChange }: RoleFilterProps) {
  const activeLabel = ROLE_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "All roles";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ShieldIcon className="size-3.5" aria-hidden="true" />
          {activeLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as TeamRole | "ALL")}>
          {ROLE_FILTER_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
