"use client";

import { ChevronDownIcon, ListFilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DECISION_CATEGORY_FILTER_OPTIONS } from "@/features/decisions/config/decision-category";
import type { DecisionCategory } from "@/types/decision";

export type DecisionCategoryFilterValue = DecisionCategory | "ALL";

interface DecisionCategoryFilterProps {
  value: DecisionCategoryFilterValue;
  onChange: (value: DecisionCategoryFilterValue) => void;
}

/** Category filter (includes an "All categories" option) — same pattern as memories' CategoryFilter. */
export function DecisionCategoryFilter({ value, onChange }: DecisionCategoryFilterProps) {
  const current =
    DECISION_CATEGORY_FILTER_OPTIONS.find((option) => option.value === value) ??
    DECISION_CATEGORY_FILTER_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="justify-between font-normal">
          <span className="flex items-center gap-2">
            <ListFilterIcon className="text-muted-foreground size-4" aria-hidden="true" />
            {current.label}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as DecisionCategoryFilterValue)}
        >
          {DECISION_CATEGORY_FILTER_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
