import {
  FileTextIcon,
  FileImageIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileCodeIcon,
  FileIcon,
  type LucideIcon,
} from "lucide-react";

export type FileTypeCategory =
  | "document"
  | "spreadsheet"
  | "presentation"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "code"
  | "other";

export interface FileTypeConfigEntry {
  icon: LucideIcon;
  label: string;
  category: FileTypeCategory;
}

export const FILE_CATEGORY_LABEL: Record<FileTypeCategory, string> = {
  document: "Documents",
  spreadsheet: "Spreadsheets",
  presentation: "Presentations",
  image: "Images",
  video: "Videos",
  audio: "Audio",
  archive: "Archives",
  code: "Code",
  other: "Other",
};

/**
 * Centralized extension -> icon/label/category mapping (F9 architecture
 * decision: file icon strategy — same pattern as F7's ACTIVITY_CONFIG and
 * F8's CATEGORY_LABEL). Keyed by lowercased file extension rather than
 * mimeType, since that's what's visually meaningful to users and what a
 * filename already carries. DEFAULT_FILE_TYPE covers any unrecognized or
 * missing extension, so new file types just need a new entry here — no
 * Files component ever branches on extension/mimeType itself.
 */
const FILE_TYPE_CONFIG: Record<string, FileTypeConfigEntry> = {
  pdf: { icon: FileTextIcon, label: "PDF", category: "document" },
  doc: { icon: FileTextIcon, label: "Word", category: "document" },
  docx: { icon: FileTextIcon, label: "Word", category: "document" },
  txt: { icon: FileTextIcon, label: "Text", category: "document" },
  md: { icon: FileTextIcon, label: "Markdown", category: "document" },
  xls: { icon: FileSpreadsheetIcon, label: "Excel", category: "spreadsheet" },
  xlsx: { icon: FileSpreadsheetIcon, label: "Excel", category: "spreadsheet" },
  csv: { icon: FileSpreadsheetIcon, label: "CSV", category: "spreadsheet" },
  ppt: { icon: FileTextIcon, label: "PowerPoint", category: "presentation" },
  pptx: { icon: FileTextIcon, label: "PowerPoint", category: "presentation" },
  png: { icon: FileImageIcon, label: "Image", category: "image" },
  jpg: { icon: FileImageIcon, label: "Image", category: "image" },
  jpeg: { icon: FileImageIcon, label: "Image", category: "image" },
  gif: { icon: FileImageIcon, label: "Image", category: "image" },
  svg: { icon: FileImageIcon, label: "Image", category: "image" },
  webp: { icon: FileImageIcon, label: "Image", category: "image" },
  mp4: { icon: FileVideoIcon, label: "Video", category: "video" },
  mov: { icon: FileVideoIcon, label: "Video", category: "video" },
  avi: { icon: FileVideoIcon, label: "Video", category: "video" },
  mp3: { icon: FileAudioIcon, label: "Audio", category: "audio" },
  wav: { icon: FileAudioIcon, label: "Audio", category: "audio" },
  zip: { icon: FileArchiveIcon, label: "Archive", category: "archive" },
  rar: { icon: FileArchiveIcon, label: "Archive", category: "archive" },
  "7z": { icon: FileArchiveIcon, label: "Archive", category: "archive" },
  json: { icon: FileCodeIcon, label: "Code", category: "code" },
  js: { icon: FileCodeIcon, label: "Code", category: "code" },
  ts: { icon: FileCodeIcon, label: "Code", category: "code" },
  tsx: { icon: FileCodeIcon, label: "Code", category: "code" },
  html: { icon: FileCodeIcon, label: "Code", category: "code" },
  css: { icon: FileCodeIcon, label: "Code", category: "code" },
};

export const DEFAULT_FILE_TYPE: FileTypeConfigEntry = {
  icon: FileIcon,
  label: "File",
  category: "other",
};

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

export function getFileTypeConfig(fileName: string): FileTypeConfigEntry {
  return FILE_TYPE_CONFIG[getFileExtension(fileName)] ?? DEFAULT_FILE_TYPE;
}

export interface FileTypeFilterOption {
  value: FileTypeCategory | "ALL";
  label: string;
}

export const FILE_TYPE_FILTER_OPTIONS: FileTypeFilterOption[] = [
  { value: "ALL", label: "All types" },
  ...(Object.entries(FILE_CATEGORY_LABEL) as [FileTypeCategory, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];
