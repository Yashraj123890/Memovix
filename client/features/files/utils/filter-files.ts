import { getFileTypeConfig, type FileTypeCategory } from "@/features/files/config/file-type";
import type { ProjectFile } from "@/types/file";

export interface FileFilters {
  search: string;
  category: FileTypeCategory | "ALL";
}

/**
 * Client-side search + type filtering. GET /files/project/:projectId
 * (server/src/controllers/project-file.controller.ts) takes no query
 * params at all, so both happen here rather than being sent as request
 * params — same situation as F5 Projects, unlike F8 Memories which has a
 * dedicated search endpoint.
 */
export function filterFiles(files: ProjectFile[], { search, category }: FileFilters): ProjectFile[] {
  const normalizedSearch = search.trim().toLowerCase();

  return files.filter((file) => {
    const matchesCategory =
      category === "ALL" || getFileTypeConfig(file.originalName).category === category;
    const matchesSearch =
      normalizedSearch.length === 0 || file.originalName.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });
}
