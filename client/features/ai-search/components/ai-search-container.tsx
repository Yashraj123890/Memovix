"use client";

import { useState } from "react";
import { SearchXIcon, SparklesIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FadeIn } from "@/components/motion/fade-in";
import { AiSearchInput } from "@/features/ai-search/components/ai-search-input";
import { AiSearchSkeleton } from "@/features/ai-search/components/ai-search-skeleton";
import { SearchResultsList } from "@/features/ai-search/components/search-results-list";
import { useAiSearchQuery } from "@/features/ai-search/hooks/use-ai-search-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/utils/error";

interface AiSearchContainerProps {
  projectId: string;
}

/**
 * The only place in this feature that calls useAiSearchQuery and owns
 * search state — same shape as MemoriesContainer (F8). Debounced
 * (~300ms, matching Memories' search debounce) before it reaches the
 * query hook since every distinct query is a real POST /api/ai/search
 * request (embedding generation + a vector query), not a client-side
 * filter.
 */
export function AiSearchContainer({ projectId }: AiSearchContainerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const trimmed = debouncedSearch.trim();

  const { data: results, isLoading, isError, error, refetch } = useAiSearchQuery(
    projectId,
    debouncedSearch,
  );

  return (
    <div className="flex flex-col gap-6">
      <AiSearchInput value={search} onChange={setSearch} />

      {!trimmed ? (
        <FadeIn>
          <EmptyState
            icon={<SparklesIcon className="size-5" />}
            title="Search this project's memory"
            description="Ask a question or describe what you're looking for — results are matched by meaning, not just keywords."
          />
        </FadeIn>
      ) : isLoading ? (
        <AiSearchSkeleton />
      ) : isError ? (
        <FadeIn>
          <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
        </FadeIn>
      ) : results && results.length > 0 ? (
        <SearchResultsList results={results} projectId={projectId} />
      ) : (
        <FadeIn>
          <EmptyState
            icon={<SearchXIcon className="size-5" />}
            title="No matching memories"
            description="Try rephrasing your search or asking about something else in this project."
          />
        </FadeIn>
      )}
    </div>
  );
}
