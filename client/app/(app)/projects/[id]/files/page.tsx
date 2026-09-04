"use client";

import { useParams } from "next/navigation";
import { FilesContainer } from "@/features/files/components/files-container";

/**
 * "/projects/[id]/files" — F9 replaces the F6 placeholder with the real
 * document repository browsing view.
 */
export default function ProjectFilesPage() {
  const { id } = useParams<{ id: string }>();

  return <FilesContainer projectId={id} />;
}
