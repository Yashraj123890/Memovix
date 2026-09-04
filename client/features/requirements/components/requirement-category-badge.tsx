import { Badge } from "@/components/ui/badge";
import { requirementCategoryLabel } from "@/features/requirements/config/requirement-category";

const CATEGORY_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "info" | "warning"
> = {
  design: "info",
  content: "secondary",
  technical: "warning",
  other: "outline",
};

/** Small colored badge for a requirement's category (mirrors DecisionCategoryBadge). */
export function RequirementCategoryBadge({
  category,
}: {
  category: string | null;
}) {
  const variant = (category && CATEGORY_VARIANT[category]) || "outline";
  return <Badge variant={variant}>{requirementCategoryLabel(category)}</Badge>;
}
