"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/fade-in";

interface AiSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Wrapped in its own FadeIn (the "search bar entrance" from F13's Motion
 * requirements) — the page-level FadeIn around the whole container would
 * otherwise cover this too, but giving the input its own beat makes it
 * read as the page's focal point on first paint.
 */
export function AiSearchInput({ value, onChange }: AiSearchInputProps) {
  return (
    <FadeIn>
      <div className="relative">
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask anything about this project..."
          className="h-11 pl-10 text-sm"
          aria-label="AI search"
          autoFocus
        />
      </div>
    </FadeIn>
  );
}
