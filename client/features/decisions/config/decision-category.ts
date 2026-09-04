import type { DecisionCategory } from "@/types/decision";

/** Category -> label lookup, same pattern as features/memories/config/category.ts. */
export const DECISION_CATEGORY_LABEL: Record<DecisionCategory, string> = {
  SCOPE: "Scope",
  TIMELINE: "Timeline",
  BUDGET: "Budget",
  DESIGN: "Design",
  OTHER: "Custom",
};

export function getDecisionCategoryLabel(decision: {
  category: DecisionCategory;
  customCategory?: string | null;
}): string {
  return decision.customCategory?.trim() || DECISION_CATEGORY_LABEL[decision.category];
}

/** Badge variant per category (variants defined in components/ui/badge.tsx). */
export const DECISION_CATEGORY_VARIANT: Record<
  DecisionCategory,
  "info" | "warning" | "success" | "secondary" | "outline"
> = {
  SCOPE: "info",
  TIMELINE: "warning",
  BUDGET: "success",
  DESIGN: "secondary",
  OTHER: "outline",
};

export interface DecisionCategoryFilterOption {
  value: DecisionCategory | "ALL";
  label: string;
}

export const DECISION_CATEGORY_FILTER_OPTIONS: DecisionCategoryFilterOption[] = [
  { value: "ALL", label: "All categories" },
  { value: "SCOPE", label: DECISION_CATEGORY_LABEL.SCOPE },
  { value: "TIMELINE", label: DECISION_CATEGORY_LABEL.TIMELINE },
  { value: "BUDGET", label: DECISION_CATEGORY_LABEL.BUDGET },
  { value: "DESIGN", label: DECISION_CATEGORY_LABEL.DESIGN },
  { value: "OTHER", label: "Custom categories" },
];
