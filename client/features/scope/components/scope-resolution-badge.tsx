import { Badge } from "@/components/ui/badge";
import {
  RESOLUTION_META,
  resolutionLabel,
} from "@/features/scope/config/scope";

/** Badge for a scope-flag resolution (pending / accepted_into_scope / declined). */
export function ScopeResolutionBadge({ resolution }: { resolution: string }) {
  const variant = RESOLUTION_META[resolution]?.variant ?? "outline";
  return <Badge variant={variant}>{resolutionLabel(resolution)}</Badge>;
}
