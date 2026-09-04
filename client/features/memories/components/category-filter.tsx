"use client";

import { TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_FILTER_OPTIONS } from "@/features/memories/config/category";
import type { MemoryCategory } from "@/types/memory";

interface CategoryFilterProps {
  value: MemoryCategory | "ALL";
  onChange: (value: MemoryCategory | "ALL") => void;
}

/**
 * Dropdown rather than a button row (as ProjectsToolbar's status filter
 * uses) — 8 memory categories plus "All" would wrap awkwardly as buttons,
 * where Projects only ever has 4 statuses.
 */
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const activeLabel =
    CATEGORY_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "All categories";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <TagIcon className="size-3.5" aria-hidden="true" />
          {activeLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as MemoryCategory | "ALL")}
        >
          {CATEGORY_FILTER_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
