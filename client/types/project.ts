/**
 * Mirrors the Project model in server/prisma/schema.prisma exactly. The
 * repository (server/src/repositories/project.repository.ts) returns the
 * raw Prisma row with no included relations or computed fields — no
 * memberCount, no owner object — so every consumer (dashboard, projects
 * list, project overview) works from this exact shape, not a padded one.
 */
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Project {
  id: string;
  tenantId: string;
  ownerId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Body accepted by POST /projects (server/src/controllers/project.controller.ts
 * createProject). The controller only reads `name`/`description` off
 * req.body — status/tenantId/ownerId are set server-side (status defaults
 * to ACTIVE via the Prisma schema) — so this is intentionally narrower than
 * Project. There is no backend support today for client company, start
 * date, target completion date, or a project color/icon; the Project model
 * has no columns for them, so they're deliberately not part of this type.
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

/**
 * Body accepted by PUT /projects/:id (server/src/controllers/project.controller.ts
 * updateProject → ProjectService.updateProject). All fields optional — the
 * lifecycle transitions send only `status`. Mirrors the service's update shape;
 * no new backend endpoint or column is involved.
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}
