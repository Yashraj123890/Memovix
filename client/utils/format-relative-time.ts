const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 31_536_000_000 },
  { unit: "month", ms: 2_592_000_000 },
  { unit: "week", ms: 604_800_000 },
  { unit: "day", ms: 86_400_000 },
  { unit: "hour", ms: 3_600_000 },
  { unit: "minute", ms: 60_000 },
];

/**
 * "2 hours ago", "yesterday", "3 days ago" — built on the standard
 * Intl.RelativeTimeFormat rather than a new dependency. Used by the F4
 * dashboard widgets; reusable by any future feature with timestamps
 * (Timeline, Comments, Notifications, ...).
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();

  for (const { unit, ms } of UNITS) {
    if (Math.abs(diffMs) >= ms) {
      return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / ms), unit);
    }
  }

  return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 1000), "second");
}
