import { Badge } from "@/components/ui/badge";
import type { FileIngestStatus } from "@/types/file";

const STATUS_CONFIG: Record<
  FileIngestStatus,
  { label: string; variant: "secondary" | "info" | "success" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  PROCESSING: { label: "Processing", variant: "info" },
  INDEXED: { label: "Indexed", variant: "success" },
  FAILED: { label: "Failed", variant: "destructive" },
  SKIPPED: { label: "Skipped", variant: "outline" },
};

export function FileIngestStatusBadge({
  status,
  title,
}: {
  status: FileIngestStatus;
  title?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} title={title}>
      {config.label}
    </Badge>
  );
}
