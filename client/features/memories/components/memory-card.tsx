import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMemoryCategoryLabel } from "@/features/memories/config/category";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { Memory } from "@/types/memory";

interface MemoryCardProps {
  memory: Memory;
  projectId: string;
}

/**
 * `projectId` added in F12 so the card can link to
 * /projects/[id]/memories/[memoryId] — otherwise still deliberately flat
 * props so future additions (AI Summary, Tags, Pinning, a comment count)
 * extend the Memory type and this card's JSX without changing the card's
 * contract. Content is elegantly truncated via line-clamp rather than a
 * hard character cut, so it wraps naturally at the card's width.
 */
export function MemoryCard({ memory, projectId }: MemoryCardProps) {
  return (
    <Link href={`/projects/${projectId}/memories/${memory.id}`} className="block h-full">
      <Card className="hover:border-primary/40 h-full transition-colors">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-foreground line-clamp-2 text-sm font-semibold">{memory.title}</h3>
            <Badge variant="outline" className="shrink-0">
              {getMemoryCategoryLabel(memory)}
            </Badge>
          </div>

          <p className="text-muted-foreground line-clamp-4 flex-1 text-sm whitespace-pre-line">
            {memory.content}
          </p>

          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
            <span>{memory.createdBy?.name ?? "Unknown author"}</span>
            <span>Updated {formatRelativeTime(memory.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
