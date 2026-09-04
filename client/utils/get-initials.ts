/**
 * "Jane Doe" -> "JD". Single-word names use their first two letters.
 *
 * Promoted to this shared top-level location for the Clients feature —
 * features/team/utils/get-initials.ts, features/comments/utils/get-initials.ts
 * and features/ai-workspace/utils/get-initials.ts each carry their own
 * identical copy (a deliberate per-feature-independence choice at the
 * time), but the comments copy's own doc comment already flagged this as
 * "worth promoting... if a third feature ever needs it" — Clients is the
 * fourth, so it uses this shared one instead of adding a fifth duplicate.
 * The three existing copies are left as-is (out of scope here).
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
