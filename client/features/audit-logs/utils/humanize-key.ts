/**
 * "fileName" -> "File Name", "mimeType" -> "Mime Type" — used to render
 * an AuditLog's free-form `details` JSON as readable key/value rows in
 * the detail drawer instead of a raw JSON blob.
 */
export function humanizeKey(key: string): string {
  const withSpaces = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
