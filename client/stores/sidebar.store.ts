"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

const SIDEBAR_STORAGE_KEY = "memovix-sidebar";

// Same SSR guard as stores/auth.store.ts — this module is evaluated on the
// server too, where `localStorage` doesn't exist.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

interface SidebarState {
  /** Desktop/tablet icon-rail vs full-width. Persisted — a UI preference
   * worth remembering across sessions (Linear/Notion do the same). */
  isCollapsed: boolean;
  /** Mobile drawer open/closed. Deliberately never persisted — a drawer
   * must always start closed on load, regardless of how it was last left. */
  isMobileOpen: boolean;
}

interface SidebarActions {
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

type SidebarStore = SidebarState & SidebarActions;

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
    }),
    {
      name: SIDEBAR_STORAGE_KEY,
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : localStorage)),
      // isMobileOpen is excluded on purpose — see the doc comment above.
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    },
  ),
);
