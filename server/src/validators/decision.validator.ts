import { z } from "zod";

/**
 * Body schema for POST /projects/:projectId/decisions (manual decision entry).
 * Category values match the DecisionCategory enum in schema.prisma.
 */
export const createDecisionSchema = z.object({
  category: z.enum(["SCOPE", "TIMELINE", "BUDGET", "DESIGN", "OTHER"]),
  customCategory: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().min(1, "Description is required").max(5000),
}).superRefine((value, context) => {
  if (value.category === "OTHER" && !value.customCategory) {
    context.addIssue({
      code: "custom",
      path: ["customCategory"],
      message: "Custom category is required",
    });
  }
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;
