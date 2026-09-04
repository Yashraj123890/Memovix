import { FileRow } from "@/features/files/components/file-row";
import type { ProjectFile } from "@/types/file";

interface FileListProps {
  files: ProjectFile[];
  projectId: string;
}

/**
 * -mx-6 lets the row dividers span the full card width while each row's
 * own px-6 keeps content aligned with the card's padding — same
 * full-bleed-row-inside-a-padded-card pattern as ProjectsOverview (F4).
 */
export function FileList({ files, projectId }: FileListProps) {
  return (
    <ul className="divide-border -mx-6 flex flex-col divide-y">
      {files.map((file) => (
        <FileRow key={file.id} file={file} projectId={projectId} />
      ))}
    </ul>
  );
}
