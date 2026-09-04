import { AIConfig } from "../config/ai.config";

/**
 * Recursive-ish character chunker (blueprint §8.4). Chunk size and overlap are
 * configured in tokens (AIConfig, env-driven) and converted to character
 * windows via a ~4-chars-per-token heuristic. Each window is backed off to the
 * nearest natural boundary (paragraph > line > sentence > word) so chunks stay
 * semantically coherent, and adjacent chunks overlap so a fact split across a
 * boundary still appears whole in at least one chunk.
 *
 * characterStart/characterEnd index into the normalized (\r\n -> \n) extracted
 * text — lightweight metadata for debugging and future citation highlighting.
 */
export interface TextChunk {
  chunkIndex: number;
  content: string;
  characterStart: number;
  characterEnd: number;
  tokenEstimate: number;
}

export interface ChunkOptions {
  chunkSize?: number; // in tokens
  chunkOverlap?: number; // in tokens
}

const CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / CHARS_PER_TOKEN));
}

/** Find the best boundary offset within [min, max) of `text`, or `max` if none. */
function findBoundary(text: string, min: number, max: number): number {
  if (min >= max) return max;
  const window = text.slice(min, max);

  const paragraph = window.lastIndexOf("\n\n");
  if (paragraph > 0) return min + paragraph + 2;

  const line = window.lastIndexOf("\n");
  if (line > 0) return min + line + 1;

  let sentence = -1;
  for (const marker of [". ", "! ", "? ", ".\n", "!\n", "?\n"]) {
    sentence = Math.max(sentence, window.lastIndexOf(marker));
  }
  if (sentence > 0) return min + sentence + 2;

  const space = window.lastIndexOf(" ");
  if (space > 0) return min + space + 1;

  return max;
}

export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const chunkSizeTokens = options.chunkSize ?? AIConfig.chunkSize;
  const overlapTokens = options.chunkOverlap ?? AIConfig.chunkOverlap;

  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.trim()) return [];

  const maxChars = Math.max(1, chunkSizeTokens * CHARS_PER_TOKEN);
  const overlapChars = Math.min(
    Math.max(0, overlapTokens * CHARS_PER_TOKEN),
    Math.floor(maxChars / 2),
  );
  const minChars = Math.floor(maxChars * 0.5);

  const chunks: TextChunk[] = [];
  const length = normalized.length;
  let start = 0;
  let index = 0;

  while (start < length) {
    let end = Math.min(start + maxChars, length);

    // Only back off to a boundary when we're not already at the end of the text.
    if (end < length) {
      end = findBoundary(normalized, start + minChars, end);
    }

    const content = normalized.slice(start, end).trim();
    if (content.length > 0) {
      chunks.push({
        chunkIndex: index,
        content,
        characterStart: start,
        characterEnd: end,
        tokenEstimate: estimateTokens(content),
      });
      index += 1;
    }

    if (end >= length) break;

    // Advance with overlap, always moving forward by at least one character.
    start = Math.max(end - overlapChars, start + 1);
  }

  return chunks;
}
