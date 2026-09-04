/**
 * Mirrors the Timeline model in server/prisma/schema.prisma. `action` is a
 * free-form string on the backend (no enum), not a fixed set of values —
 * the repository (server/src/repositories/timelineRepository.ts) includes
 * the acting user's {id, name, email}, which is null for system-generated
 * events with no userId.
 */
export interface TimelineEventUser {
  id: string;
  name: string;
  email: string;
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  userId: string | null;
  action: string;
  description: string;
  createdAt: string;
  user: TimelineEventUser | null;
}
