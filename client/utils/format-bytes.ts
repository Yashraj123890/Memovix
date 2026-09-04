const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/**
 * "2.4 GB", "580 KB" — used by the F4 Storage Usage widget; reusable by
 * any future feature that displays file sizes (Files, Uploads).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) {
    return "0 B";
  }

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(exponent === 0 ? 0 : decimals)} ${UNITS[exponent]}`;
}
