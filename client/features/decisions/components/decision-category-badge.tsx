import { Badge } from "@/components/ui/badge";
import {
  DECISION_CATEGORY_VARIANT,
  getDecisionCategoryLabel,
} from "@/features/decisions/config/decision-category";
import type { DecisionCategory } from "@/types/decision";

export function DecisionCategoryBadge({
  category,
  customCategory,
}: {
  category: DecisionCategory;
  customCategory?: string | null;
}) {
  return (
    <Badge variant={DECISION_CATEGORY_VARIANT[category]}>
      {getDecisionCategoryLabel({ category, customCategory })}
    </Badge>
  );
}
