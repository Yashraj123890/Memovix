"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { usePageHeaderStore } from "@/stores/page-header.store";

/**
 * Reads whatever the current page declared via
 * features/layout/hooks/use-page-header.ts. Renders nothing when a page
 * hasn't declared any breadcrumbs (e.g. a top-level page like Dashboard).
 */
export function Breadcrumbs() {
  const breadcrumbs = usePageHeaderStore((state) => state.breadcrumbs);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1 text-xs">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRightIcon className="size-3 shrink-0" aria-hidden="true" />}
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="hover:text-foreground truncate transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-foreground truncate font-medium" : "truncate"}
                aria-current={isLast ? "page" : undefined}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
