"use client";

import { ChevronDownIcon, TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_LABEL } from "@/features/memories/config/category";
import type { MemoryFormValues } from "@/features/memories/schemas/memory.schema";

interface CategoryPickerProps {
  value: MemoryFormValues["category"];
  onChange: (value: MemoryFormValues["category"]) => void;
  disabled?: boolean;
}

const CATEGORIES = [
  "NOTE",
  "DECISION",
  "MEETING",
  "FEATURE",
  "BUG",
  "API",
  "DOCUMENTATION",
] as const;

/**
 * Same DropdownMenuRadioGroup pattern as CategoryFilter, but scoped to the
 * create/edit form: no "ALL" option (meaningless for a single memory) and
 * always has exactly one value selected, never optional.
 */
export function CategoryPicker({ value, onChange, disabled }: CategoryPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="memory-category"
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <TagIcon className="text-muted-foreground size-4" aria-hidden="true" />
            {value === "CUSTOM" ? "Custom category" : CATEGORY_LABEL[value]}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full min-w-56">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as MemoryFormValues["category"])}
        >
          {CATEGORIES.map((category) => (
            <DropdownMenuRadioItem key={category} value={category}>
              {CATEGORY_LABEL[category]}
            </DropdownMenuRadioItem>
          ))}
          <DropdownMenuRadioItem value="CUSTOM">Custom category...</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
