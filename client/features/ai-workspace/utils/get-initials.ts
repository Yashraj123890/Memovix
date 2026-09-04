/**
 * "Jane Doe" -> "JD". Duplicated from features/comments/utils/get-initials.ts
 * following that file's own precedent of duplicating this small helper per
 * feature rather than reaching across feature boundaries.
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
