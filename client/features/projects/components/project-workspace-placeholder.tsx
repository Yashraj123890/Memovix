import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectWorkspacePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Shared shell for every not-yet-built workspace tab (Timeline, Memories,
 * Files, Team, AI Search). Each future phase deletes the corresponding
 * tab's page.tsx body and renders its real feature instead — this
 * component and the route itself don't need to change.
 */
export function ProjectWorkspacePlaceholder({
  icon: Icon,
  title,
  description,
}: ProjectWorkspacePlaceholderProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground text-sm font-semibold">{title}</h3>
            <Badge variant="outline">Coming soon</Badge>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
