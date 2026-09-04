import { z } from "zod";

/**
 * Create/edit form schema. `dueDate` is the raw `yyyy-mm-dd` string from an
 * <input type="date"> (empty when unset); the backend coerces it to a Date.
 * Empty strings are allowed here and normalized to undefined/null in the
 * mutation layer.
 */
export const deliverableSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().optional(),
});

export type DeliverableFormValues = z.infer<typeof deliverableSchema>;
