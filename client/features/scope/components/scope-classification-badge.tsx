import { Badge } from "@/components/ui/badge";
import {
  CLASSIFICATION_META,
  classificationLabel,
} from "@/features/scope/config/scope";

/** Badge for a scope-flag classification (new / modifies_existing / out_of_scope). */
export function ScopeClassificationBadge({
  classification,
}: {
  classification: string;
}) {
  const variant = CLASSIFICATION_META[classification]?.variant ?? "outline";
  return <Badge variant={variant}>{classificationLabel(classification)}</Badge>;
}
