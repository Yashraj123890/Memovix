import type { Memory, MemoryCategory } from "@/types/memory";

/**
 * Client-side category filtering, applied on top of whichever result set
 * useMemoriesQuery returns (list or search) — the backend has no
 * category query param on either endpoint.
 */
export function filterMemoriesByCategory(
  memories: Memory[],
  category: MemoryCategory | "ALL",
): Memory[] {
  if (category === "ALL") {
    return memories;
  }
  return memories.filter((memory) => memory.category === category);
}
