/**
 * Requirement configuration (blueprint §3.2.4 / §6.2.8).
 *
 * The `requirements.category` column is a free string (VARCHAR(50) in the
 * blueprint) rather than a Prisma enum, so the set of allowed categories can be
 * tuned per deployment without a schema migration. This module is the single
 * source of truth for that allow-list; Phase 2's Zod validator will reject any
 * extracted/edited requirement whose category is not in this set — no magic
 * strings scattered across the codebase.
 *
 * Override via REQUIREMENT_CATEGORIES (comma-separated). Defaults mirror the
 * blueprint's examples (design, content, technical) plus a catch-all.
 */
const DEFAULT_REQUIREMENT_CATEGORIES = [
  "design",
  "content",
  "technical",
  "other",
] as const;

function parseCategories(raw: string | undefined): string[] {
  if (!raw) {
    return [...DEFAULT_REQUIREMENT_CATEGORIES];
  }

  const parsed = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);

  return parsed.length > 0 ? parsed : [...DEFAULT_REQUIREMENT_CATEGORIES];
}

export const RequirementConfig = {
  categories: parseCategories(process.env.REQUIREMENT_CATEGORIES),
} as const;
