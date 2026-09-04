"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryFilter } from "@/features/memories/components/category-filter";
import type { MemoryCategory } from "@/types/memory";

interface MemoriesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: MemoryCategory | "ALL";
  onCategoryChange: (value: MemoryCategory | "ALL") => void;
  onNewMemory: () => void;
}

export function MemoriesToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onNewMemory,
}: MemoriesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search memories..."
            className="pl-9"
            aria-label="Search memories"
          />
        </div>

        <CategoryFilter value={category} onChange={onCategoryChange} />
      </div>

      <Button type="button" size="sm" onClick={onNewMemory} className="gap-1.5">
        <PlusIcon className="size-3.5" aria-hidden="true" />
        New memory
      </Button>
    </div>
  );
}
