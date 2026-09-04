import pdfParse from "pdf-parse";
import mammoth from "mammoth";

/**
 * Text extraction for the document ingestion pipeline (blueprint §8.2).
 * Milestone 5 supports text-based documents only: PDF, DOCX, TXT, Markdown.
 * OCR, spreadsheets and presentations are intentionally out of scope.
 *
 * Two distinct failure modes are separated on purpose:
 *  - `{ supported: false }`  -> the format isn't a text document (image, etc.)
 *                              -> the caller marks the file SKIPPED.
 *  - throws                  -> a supported format failed to parse
 *                              -> the caller marks the file FAILED.
 */
export type ExtractionResult =
  | { supported: true; text: string; method: "pdf" | "docx" | "text" }
  | { supported: false; reason: string };

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function hasExtension(fileName: string | undefined, ...exts: string[]): boolean {
  if (!fileName) return false;
  const lower = fileName.toLowerCase();
  return exts.some((ext) => lower.endsWith(ext));
}

function isPdf(mimeType: string, fileName?: string): boolean {
  return mimeType === "application/pdf" || hasExtension(fileName, ".pdf");
}

function isDocx(mimeType: string, fileName?: string): boolean {
  return mimeType === DOCX_MIME || hasExtension(fileName, ".docx");
}

function isTextOrMarkdown(mimeType: string, fileName?: string): boolean {
  return (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    mimeType === "text/x-markdown" ||
    hasExtension(fileName, ".txt", ".md", ".markdown")
  );
}

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName?: string,
): Promise<ExtractionResult> {
  try {
    if (isPdf(mimeType, fileName)) {
      const data = await pdfParse(buffer);
      return { supported: true, text: data.text ?? "", method: "pdf" };
    }

    if (isDocx(mimeType, fileName)) {
      const result = await mammoth.extractRawText({ buffer });
      return { supported: true, text: result.value ?? "", method: "docx" };
    }

    if (isTextOrMarkdown(mimeType, fileName)) {
      return { supported: true, text: buffer.toString("utf-8"), method: "text" };
    }

    return {
      supported: false,
      reason: `Unsupported type for text ingestion: ${mimeType || "unknown"}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "extraction failed";
    throw new Error(`Text extraction failed (${mimeType}): ${message}`);
  }
}
