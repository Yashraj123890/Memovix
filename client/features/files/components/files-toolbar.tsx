"use client";

import { useRef, type ChangeEvent } from "react";
import { SearchIcon, UploadIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileTypeFilter } from "@/features/files/components/file-type-filter";
import { UPLOAD_ACCEPT_ATTR } from "@/features/files/config/upload";
import type { FileTypeCategory } from "@/features/files/config/file-type";

interface FilesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: FileTypeCategory | "ALL";
  onCategoryChange: (value: FileTypeCategory | "ALL") => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
}

/**
 * The upload control is a real <input type="file"> hidden behind a styled
 * button (clicked via a ref) rather than a custom drop zone — smallest
 * surface that gets native file-picker behavior (keyboard, mobile, OS
 * dialog) for free. `key={isUploading}` resets the input after each
 * upload attempt so selecting the exact same file twice in a row still
 * fires onChange the second time.
 */
export function FilesToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onUpload,
  isUploading,
}: FilesToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search files..."
            className="pl-9"
            aria-label="Search files"
          />
        </div>

        <FileTypeFilter value={category} onChange={onCategoryChange} />
      </div>

      <Button
        type="button"
        size="sm"
        className="gap-1.5"
        loading={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon className="size-3.5" aria-hidden="true" />
        Upload file
      </Button>
      <input
        key={String(isUploading)}
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT_ATTR}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload file"
      />
    </div>
  );
}
