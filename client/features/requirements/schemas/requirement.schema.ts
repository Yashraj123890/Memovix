import { z } from "zod";
import { REQUIREMENT_CATEGORIES } from "@/features/requirements/config/requirement-category";

/**
 * Edit form for a persisted requirement. Mirrors the backend
 * updateRequirementSchema (server/src/validators/requirement.validator.ts):
 * title required, category one of the allowed values, description optional.
 */
export const requirementEditSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  category: z.enum(REQUIREMENT_CATEGORIES),
  description: z.string().trim().max(5000),
});

export type RequirementEditValues = z.infer<typeof requirementEditSchema>;
