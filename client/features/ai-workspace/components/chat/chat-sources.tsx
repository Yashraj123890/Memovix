import Link from "next/link";
import {
  ClipboardListIcon,
  FileTextIcon,
  GavelIcon,
  MessageSquareIcon,
  NotebookPenIcon,
  PackageIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ChatSource } from "@/types/ai";
import { type SourceType, sourceHref } from "@/utils/source-link";

interface ChatSourcesProps {
  projectId: string;
  sources: ChatSource[];
}

const SOURCE_ICON: Record<SourceType, LucideIcon> = {
  MEMORY: NotebookPenIcon,
  DOCUMENT: FileTextIcon,
  REQUIREMENT: ClipboardListIcon,
  DECISION: GavelIcon,
  MEETING_NOTE: UsersIcon,
  DELIVERABLE: PackageIcon,
  COMMENT: MessageSquareIcon,
};

/**
 * Citations under an assistant reply (P2 — unified retrieval). Spans every
 * project content type: an icon distinguishes the source, and the badge links to
 * the origin where a route exists (memory/file detail; the other sections' list
 * pages). Comments have no standalone page, so they render as a plain badge.
 */
export function ChatSources({ projectId, sources }: ChatSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-muted-foreground text-xs">Sources:</span>
      {sources.map((source) => {
        const Icon = SOURCE_ICON[source.sourceType] ?? FileTextIcon;
        const href = sourceHref(projectId, source.sourceType, source.sourceId);
        const key = `${source.sourceType}:${source.sourceId}`;

        const badge = (
          <Badge
            variant="outline"
            title={source.label}
            className="hover:border-primary/40 hover:bg-primary/5 hover:text-foreground max-w-[16rem] gap-1 transition-colors"
          >
            <Icon className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{source.label}</span>
            <span className="text-muted-foreground shrink-0">
              {Math.round(source.score * 100)}%
            </span>
          </Badge>
        );

        return href ? (
          <Link
            key={key}
            href={href}
            className="focus-visible:ring-ring rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          >
            {badge}
          </Link>
        ) : (
          <span key={key}>{badge}</span>
        );
      })}
    </div>
  );
}
