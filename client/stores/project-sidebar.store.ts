"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

const PROJECT_SIDEBAR_STORAGE_KEY = "memovix-project-sidebar";

// Same SSR guard as stores/sidebar.store.ts — evaluated on the server too,
// where `localStorage` doesn't exist.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

interface ProjectSidebarStore {
  /** Project sidebar icon-rail vs full-width. Persisted — a UI preference worth
   * remembering across sessions, mirroring the global sidebar's collapse. */
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

export const useProjectSidebarStore = create<ProjectSidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: PROJECT_SIDEBAR_STORAGE_KEY,
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : localStorage)),
    },
  ),
);
