import { z } from "zod";

/**
 * Body schemas for the JSON deliverable endpoints (blueprint §13.3 via the
 * shared validate() middleware). The version-upload endpoint is multipart and
 * validates its file through multer + validateFileSignature instead; its
 * optional changeSummary is read directly in the controller.
 *
 * `status` is intentionally limited to DRAFT | SUBMITTED for Milestone 2 —
 * APPROVED / REVISION_REQUESTED are owned by the Approval Workflow (M3).
 */
export const createDeliverableSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateDeliverableSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").max(255).optional(),
    description: z.string().trim().max(5000).nullish(),
    dueDate: z.coerce.date().nullish(),
    status: z.enum(["DRAFT", "SUBMITTED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update",
  });

/** Body for POST /deliverables/:id/request-revision — a required comment. */
export const revisionRequestSchema = z.object({
  comment: z.string().trim().min(1, "A comment is required").max(5000),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;
export type UpdateDeliverableInput = z.infer<typeof updateDeliverableSchema>;
export type RevisionRequestInput = z.infer<typeof revisionRequestSchema>;
