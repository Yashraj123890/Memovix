import Link from "next/link";
import { FolderKanbanIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_STATUS_BADGE_VARIANT } from "@/features/projects/config/status-filter";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

/**
 * Placeholder navigation — F5 explicitly excludes a project details page,
 * but linking to /projects/[id] now means F5.x (Project Details) only has
 * to add the route; this card doesn't change.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="group block h-full">
      <Card className="hover:border-primary/40 h-full transition-colors">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-md transition-colors">
              <FolderKanbanIcon className="size-4" aria-hidden="true" />
            </span>
            <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]} className="capitalize">
              {project.status.toLowerCase()}
            </Badge>
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <h3 className="text-foreground line-clamp-1 text-sm font-semibold">{project.name}</h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {project.description || "No description yet."}
            </p>
          </div>

          <p className="text-muted-foreground text-xs">
            Updated {formatRelativeTime(project.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
