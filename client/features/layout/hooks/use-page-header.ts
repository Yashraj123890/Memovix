"use client";

import { useEffect } from "react";
import { usePageHeaderStore, type Breadcrumb } from "@/stores/page-header.store";

interface UsePageHeaderOptions {
  title: string;
  breadcrumbs?: Breadcrumb[];
}

/**
 * Call this once per authenticated page to declare its title/breadcrumbs
 * for AppHeader to render (features/layout/components/app-header.tsx and
 * breadcrumbs.tsx). Explicit per-page declaration rather than deriving
 * breadcrumbs from the URL — see the F3 architecture discussion for why.
 *
 * Resets on unmount so navigating away doesn't leave a stale title
 * flashing before the next page's own usePageHeader call runs. If the
 * caller doesn't memoize `breadcrumbs`, this re-runs (cheaply) on every
 * render of that page.
 */
export function usePageHeader({ title, breadcrumbs }: UsePageHeaderOptions) {
  const setPageHeader = usePageHeaderStore((state) => state.setPageHeader);
  const resetPageHeader = usePageHeaderStore((state) => state.resetPageHeader);

  useEffect(() => {
    setPageHeader({ title, breadcrumbs });
    return () => resetPageHeader();
  }, [title, breadcrumbs, setPageHeader, resetPageHeader]);
}
