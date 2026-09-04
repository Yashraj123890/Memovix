import type { MemoryCategory } from "@/types/memory";

export const CATEGORY_LABEL: Record<MemoryCategory, string> = {
  NOTE: "Note",
  DECISION: "Decision",
  MEETING: "Meeting",
  FEATURE: "Feature",
  BUG: "Bug",
  API: "API",
  DOCUMENTATION: "Docs",
  OTHER: "Custom",
};

export function getMemoryCategoryLabel(memory: {
  category: MemoryCategory;
  customCategory?: string | null;
}): string {
  return memory.customCategory?.trim() || CATEGORY_LABEL[memory.category];
}

export interface CategoryFilterOption {
  value: MemoryCategory | "ALL";
  label: string;
}

export const CATEGORY_FILTER_OPTIONS: CategoryFilterOption[] = [
  { value: "ALL", label: "All categories" },
  { value: "NOTE", label: CATEGORY_LABEL.NOTE },
  { value: "DECISION", label: CATEGORY_LABEL.DECISION },
  { value: "MEETING", label: CATEGORY_LABEL.MEETING },
  { value: "FEATURE", label: CATEGORY_LABEL.FEATURE },
  { value: "BUG", label: CATEGORY_LABEL.BUG },
  { value: "API", label: CATEGORY_LABEL.API },
  { value: "DOCUMENTATION", label: CATEGORY_LABEL.DOCUMENTATION },
  { value: "OTHER", label: "Custom categories" },
];
