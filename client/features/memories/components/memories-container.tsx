"use client";

import { useState } from "react";
import { BrainCircuitIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { MemoriesToolbar } from "@/features/memories/components/memories-toolbar";
import { MemoryList } from "@/features/memories/components/memory-list";
import { MemoriesSkeleton } from "@/features/memories/components/memories-skeleton";
import { MemoryFormDialog } from "@/features/memories/components/memory-form-dialog";
import { useMemoriesQuery } from "@/features/memories/hooks/use-memories-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { filterMemoriesByCategory } from "@/features/memories/utils/filter-memories";
import { getErrorMessage } from "@/utils/error";
import type { MemoryCategory } from "@/types/memory";

interface MemoriesContainerProps {
  projectId: string;
}

/**
 * The only place in this feature that calls useMemoriesQuery and owns
 * search/category state — same shape as ProjectsView (F5) and
 * TimelineContainer (F7). Search is debounced before it reaches the
 * query hook, since (unlike Projects) each search term is a real network
 * request against GET /memories/search/query.
 *
 * Also owns the "New memory" dialog's open state — MemoryFormDialog with
 * no `memory` prop creates (POST /memories); editing an existing one opens
 * the same dialog from MemoryDetailView instead.
 */
export function MemoriesContainer({ projectId }: MemoriesContainerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MemoryCategory | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: memories, isLoading, isError, error, refetch } = useMemoriesQuery(
    projectId,
    debouncedSearch,
  );

  const filteredMemories = memories ? filterMemoriesByCategory(memories, category) : [];
  const hasResults = (memories?.length ?? 0) > 0;
  const isFiltered = Boolean(debouncedSearch) || category !== "ALL";

  return (
    <div className="flex flex-col gap-4">
      <MemoriesToolbar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        onNewMemory={() => setCreateOpen(true)}
      />

      {isLoading ? (
        <MemoriesSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredMemories.length === 0 ? (
        <EmptyState
          icon={<BrainCircuitIcon className="size-5" />}
          title={hasResults || isFiltered ? "No matching memories" : "No memories yet"}
          description={
            hasResults || isFiltered
              ? "Try a different search term or category filter."
              : "Decisions, notes and project knowledge your team captures will show up here."
          }
          action={
            !hasResults && !isFiltered ? (
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                New memory
              </Button>
            ) : undefined
          }
        />
      ) : (
        <MemoryList memories={filteredMemories} projectId={projectId} />
      )}

      <MemoryFormDialog open={createOpen} onOpenChange={setCreateOpen} projectId={projectId} />
    </div>
  );
}
