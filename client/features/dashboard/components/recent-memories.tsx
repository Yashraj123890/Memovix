import Link from "next/link";
import { BrainCircuitIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PROJECTS_ROUTE } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { DashboardMemory } from "@/types/dashboard";
import { getMemoryCategoryLabel } from "@/features/memories/config/category";

interface RecentMemoriesProps {
  memories: DashboardMemory[];
  isLoading: boolean;
  isError: boolean;
}

export function RecentMemories({ memories, isLoading, isError }: RecentMemoriesProps) {
  return (
    <SectionCard
      title="Recent memories"
      action={
        <Link href={PROJECTS_ROUTE} className="text-primary text-xs font-medium hover:underline">
          View all
        </Link>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          description="We couldn't load your recent memories."
          className="py-8"
        />
      ) : memories.length === 0 ? (
        <EmptyState
          icon={<BrainCircuitIcon className="size-5" />}
          title="No memories yet"
          description="Decisions and notes your team captures will show up here."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {memories.map((memory) => (
            <li key={memory.id} className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-foreground line-clamp-2 text-sm font-medium">{memory.title}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {getMemoryCategoryLabel(memory)}
                </Badge>
              </div>
              <span className="text-muted-foreground text-xs">
                {memory.projectName} · {formatRelativeTime(memory.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
