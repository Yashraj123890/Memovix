import type { BadgeProps } from "@/components/ui/badge";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/**
 * Display config for scope classifications and resolutions (blueprint §8.10).
 * Values mirror the backend ScopeConfig (server/src/config/scope.config.ts).
 */
export const CLASSIFICATION_META: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  new: { label: "New", variant: "warning" },
  modifies_existing: { label: "Modifies existing", variant: "info" },
  out_of_scope: { label: "Out of scope", variant: "destructive" },
};

export const RESOLUTION_META: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Pending", variant: "outline" },
  accepted_into_scope: { label: "Accepted into scope", variant: "success" },
  declined: { label: "Declined", variant: "secondary" },
};

export function classificationLabel(value: string): string {
  return CLASSIFICATION_META[value]?.label ?? value;
}

export function resolutionLabel(value: string): string {
  return RESOLUTION_META[value]?.label ?? value;
}

/** Resolution filter options for the dashboard. */
export const RESOLUTION_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted_into_scope", label: "Accepted" },
  { value: "declined", label: "Declined" },
] as const;

export type ResolutionFilterValue =
  (typeof RESOLUTION_FILTERS)[number]["value"];
