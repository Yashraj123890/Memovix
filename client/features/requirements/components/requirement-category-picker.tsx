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
import {
  REQUIREMENT_CATEGORIES,
  requirementCategoryLabel,
  type RequirementCategory,
} from "@/features/requirements/config/requirement-category";

interface RequirementCategoryPickerProps {
  value: RequirementCategory;
  onChange: (value: RequirementCategory) => void;
  disabled?: boolean;
}

/** Single-select category picker — same pattern as DecisionCategoryPicker. */
export function RequirementCategoryPicker({
  value,
  onChange,
  disabled,
}: RequirementCategoryPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <TagIcon
              className="text-muted-foreground size-4"
              aria-hidden="true"
            />
            {requirementCategoryLabel(value)}
          </span>
          <ChevronDownIcon
            className="text-muted-foreground size-4"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full min-w-56">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as RequirementCategory)}
        >
          {REQUIREMENT_CATEGORIES.map((category) => (
            <DropdownMenuRadioItem key={category} value={category}>
              {requirementCategoryLabel(category)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
