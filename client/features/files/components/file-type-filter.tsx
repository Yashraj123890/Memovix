"use client";

import { FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FILE_TYPE_FILTER_OPTIONS, type FileTypeCategory } from "@/features/files/config/file-type";

interface FileTypeFilterProps {
  value: FileTypeCategory | "ALL";
  onChange: (value: FileTypeCategory | "ALL") => void;
}

/** Dropdown (reusing the RadioGroup/RadioItem added to DropdownMenu in F8) rather than a button row — same reasoning as Memories' category filter. */
export function FileTypeFilter({ value, onChange }: FileTypeFilterProps) {
  const activeLabel =
    FILE_TYPE_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "All types";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FilterIcon className="size-3.5" aria-hidden="true" />
          {activeLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as FileTypeCategory | "ALL")}
        >
          {FILE_TYPE_FILTER_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
