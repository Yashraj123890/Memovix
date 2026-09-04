import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Base loading placeholder — docs/design-system.md "Loading States"
 * prefers skeletons over spinners for content that has a known shape.
 * Compose with feature-specific layouts (e.g.
 * features/projects/components/projects-skeleton.tsx) that mirror the
 * real content so nothing reflows when data arrives.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
