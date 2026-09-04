"use client";

import { create } from "zustand";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderState {
  title: string;
  breadcrumbs: Breadcrumb[];
}

interface PageHeaderActions {
  setPageHeader: (header: { title: string; breadcrumbs?: Breadcrumb[] }) => void;
  resetPageHeader: () => void;
}

const DEFAULT_STATE: PageHeaderState = { title: "", breadcrumbs: [] };

/**
 * Ephemeral (never persisted) — holds whatever the currently-mounted
 * authenticated page declared via features/layout/hooks/use-page-header.ts,
 * for AppHeader (features/layout/components/app-header.tsx) to render.
 *
 * Deliberately Zustand rather than React Context: every other piece of
 * cross-component UI state in this app already goes through Zustand
 * (auth, sidebar) — see docs/coding-standards.md "Zustand" — and this
 * avoids introducing a second, one-off state-sharing mechanism just for
 * page titles.
 */
export const usePageHeaderStore = create<PageHeaderState & PageHeaderActions>()((set) => ({
  ...DEFAULT_STATE,
  setPageHeader: ({ title, breadcrumbs = [] }) => set({ title, breadcrumbs }),
  resetPageHeader: () => set(DEFAULT_STATE),
}));
