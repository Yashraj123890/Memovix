import type { Memory } from "@/types/memory";
import type { TimelineEvent } from "@/types/timeline";

/**
 * Dashboard widget data shapes. These now compose the real domain types
 * (Project/Memory/TimelineEvent/Notification) instead of a parallel mock
 * schema — see features/dashboard/hooks for how each is assembled from
 * real API calls. `projectName` is the one field none of those endpoints
 * return on their own (a memory/timeline event only knows its projectId),
 * so it's attached client-side once the owning project is known.
 */

export interface DashboardMemory extends Memory {
  projectName: string;
}

export interface DashboardActivityItem extends TimelineEvent {
  projectName: string;
}
