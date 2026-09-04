/**
 * Requirement categories. Mirrors the backend default allow-list
 * (server/src/config/requirement.config.ts — env `REQUIREMENT_CATEGORIES`,
 * default design,content,technical,other). Same client-side-mirror approach as
 * the decisions feature's category enum.
 */
export const REQUIREMENT_CATEGORIES = [
  "design",
  "content",
  "technical",
  "other",
] as const;

export type RequirementCategory = (typeof REQUIREMENT_CATEGORIES)[number];

const CATEGORY_LABELS: Record<string, string> = {
  design: "Design",
  content: "Content",
  technical: "Technical",
  other: "Other",
};

/** Human label for a category value; falls back to the raw value, then "Uncategorized". */
export function requirementCategoryLabel(
  category: string | null | undefined,
): string {
  if (!category) return "Uncategorized";
  return CATEGORY_LABELS[category] ?? category;
}
