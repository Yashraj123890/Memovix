import { Badge } from "@/components/ui/badge";
import type { DeliverableStatus } from "@/types/deliverable";

const STATUS_CONFIG: Record<
  DeliverableStatus,
  { label: string; variant: "secondary" | "info" | "success" | "warning" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SUBMITTED: { label: "Submitted", variant: "info" },
  APPROVED: { label: "Approved", variant: "success" },
  REVISION_REQUESTED: { label: "Revision requested", variant: "warning" },
};

export function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
