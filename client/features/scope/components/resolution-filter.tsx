"use client";

import { Button } from "@/components/ui/button";
import {
  RESOLUTION_FILTERS,
  type ResolutionFilterValue,
} from "@/features/scope/config/scope";

interface ResolutionFilterProps {
  value: ResolutionFilterValue;
  onChange: (value: ResolutionFilterValue) => void;
}

/** Segmented filter for scope flags by resolution state. */
export function ResolutionFilter({ value, onChange }: ResolutionFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {RESOLUTION_FILTERS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? "default" : "outline"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
