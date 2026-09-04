"use client";

import { useState } from "react";
import { FolderOpenIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilesToolbar } from "@/features/files/components/files-toolbar";
import { FileList } from "@/features/files/components/file-list";
import { FilesSkeleton } from "@/features/files/components/files-skeleton";
import { useFilesQuery } from "@/features/files/hooks/use-files-query";
import { useUploadFileMutation } from "@/features/files/hooks/use-upload-file-mutation";
import { filterFiles } from "@/features/files/utils/filter-files";
import { getErrorMessage } from "@/utils/error";
import type { FileTypeCategory } from "@/features/files/config/file-type";

interface FilesContainerProps {
  projectId: string;
}

/**
 * The only place in this feature that calls useFilesQuery and owns
 * search/type-filter state — same shape as ProjectsView (F5) and
 * MemoriesContainer (F8).
 */
export function FilesContainer({ projectId }: FilesContainerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FileTypeCategory | "ALL">("ALL");

  const { data: files, isLoading, isError, error, refetch } = useFilesQuery(projectId);
  const uploadFile = useUploadFileMutation(projectId);

  const filteredFiles = files ? filterFiles(files, { search, category }) : [];
  const hasFiles = (files?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <FilesToolbar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        onUpload={(file) => uploadFile.mutate(file)}
        isUploading={uploadFile.isPending}
      />

      {isLoading ? (
        <FilesSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredFiles.length === 0 ? (
        <EmptyState
          icon={<FolderOpenIcon className="size-5" />}
          title={hasFiles ? "No matching files" : "No files yet"}
          description={
            hasFiles
              ? "Try a different search term or file type filter."
              : "Upload a file to get started — accepted types: PDF, Word, PNG, JPEG, and plain text, up to 20 MB."
          }
        />
      ) : (
        <Card>
          <CardContent>
            <FileList files={filteredFiles} projectId={projectId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
