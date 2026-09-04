import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SemanticSearchResult } from "@/types/ai-search";
import { SOURCE_TYPE_LABEL, sourceHref } from "@/utils/source-link";

interface SearchResultCardProps {
  result: SemanticSearchResult;
  projectId: string;
}

/**
 * A single AI Search hit (P2 — unified retrieval). Results now span every
 * project content type, so the card shows the source-type label and links to the
 * origin where a route exists (memory/file detail; other sections' list pages).
 * Comments have no page, so that card is not a link.
 */
export function SearchResultCard({ result, projectId }: SearchResultCardProps) {
  const href = sourceHref(projectId, result.sourceType, result.sourceId);

  const card = (
    <Card className="hover:border-primary/40 h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground line-clamp-2 text-sm font-semibold">
            {result.title}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {Math.round(result.score * 100)}% match
          </Badge>
        </div>

        <p className="text-muted-foreground line-clamp-4 flex-1 text-sm whitespace-pre-line">
          {result.content}
        </p>

        <Badge variant="outline" className="w-fit text-xs">
          {SOURCE_TYPE_LABEL[result.sourceType]}
        </Badge>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  ) : (
    <div className="block h-full">{card}</div>
  );
}
