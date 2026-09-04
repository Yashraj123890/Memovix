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
import { DECISION_CATEGORY_LABEL } from "@/features/decisions/config/decision-category";
import type { DecisionFormValues } from "@/features/decisions/schemas/decision.schema";

interface DecisionCategoryPickerProps {
  value: DecisionFormValues["category"];
  onChange: (value: DecisionFormValues["category"]) => void;
  disabled?: boolean;
}

const CATEGORIES = ["SCOPE", "TIMELINE", "BUDGET", "DESIGN"] as const;

/** Single-select category picker for the add-decision form — same pattern as memories' CategoryPicker. */
export function DecisionCategoryPicker({ value, onChange, disabled }: DecisionCategoryPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="decision-category"
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <TagIcon className="text-muted-foreground size-4" aria-hidden="true" />
            {value === "CUSTOM" ? "Custom category" : DECISION_CATEGORY_LABEL[value]}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full min-w-56">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as DecisionFormValues["category"])}
        >
          {CATEGORIES.map((category) => (
            <DropdownMenuRadioItem key={category} value={category}>
              {DECISION_CATEGORY_LABEL[category]}
            </DropdownMenuRadioItem>
          ))}
          <DropdownMenuRadioItem value="CUSTOM">Custom category...</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
