/**
 * "Jane Doe" -> "JD". Deliberately duplicated from
 * features/team/utils/get-initials.ts rather than importing across
 * feature boundaries or promoting it this phase — F11 is scoped to only
 * touching Comments files. Worth promoting to a shared top-level utils/
 * if a third feature ever needs it.
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
