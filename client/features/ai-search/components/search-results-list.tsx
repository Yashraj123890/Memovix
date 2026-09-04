"use client";

import { AnimatePresence } from "motion/react";
import { StaggerItem } from "@/components/motion/stagger-item";
import { SearchResultCard } from "@/features/ai-search/components/search-result-card";
import type { SemanticSearchResult } from "@/types/ai-search";

interface SearchResultsListProps {
  results: SemanticSearchResult[];
  projectId: string;
}

export function SearchResultsList({ results, projectId }: SearchResultsListProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence initial={false}>
        {results.map((result, index) => (
          <StaggerItem
            key={`${result.sourceType}:${result.sourceId}`}
            index={index}
            className="list-none"
          >
            <SearchResultCard result={result} projectId={projectId} />
          </StaggerItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
