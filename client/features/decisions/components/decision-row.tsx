import { DecisionCategoryBadge } from "@/features/decisions/components/decision-category-badge";
import type { Decision } from "@/types/decision";

export function DecisionRow({ decision }: { decision: Decision }) {
  const author = decision.loggedBy?.name ?? "System";

  return (
    <li className="flex flex-col gap-1.5 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <DecisionCategoryBadge
          category={decision.category}
          customCategory={decision.customCategory}
        />
        <time className="text-muted-foreground text-xs" dateTime={decision.createdAt}>
          {new Date(decision.createdAt).toLocaleString()}
        </time>
      </div>
      <p className="text-sm whitespace-pre-wrap">{decision.description}</p>
      <p className="text-muted-foreground text-xs">by {author}</p>
    </li>
  );
}
