import { z } from "zod";

/**
 * Mirrors the backend's actual validation: ProjectService.createProject
 * (server/src/services/project.service.ts) only rejects a name that's
 * empty after trimming — there's no minimum length beyond that, and
 * description is entirely optional. Only these two fields are sent to
 * POST /projects; see CreateProjectRequest in types/project.ts for why
 * client company / dates / color-icon aren't part of this form.
 */
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
