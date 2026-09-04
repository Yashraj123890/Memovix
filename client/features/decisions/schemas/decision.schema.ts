import { z } from "zod";

/** Manual decision entry form. Mirrors the backend createDecisionSchema. */
export const decisionSchema = z.object({
  category: z.enum(["SCOPE", "TIMELINE", "BUDGET", "DESIGN", "CUSTOM"]),
  customCategory: z.string().trim().max(50, "Use 50 characters or fewer"),
  description: z.string().trim().min(1, "Description is required").max(5000),
}).superRefine((value, context) => {
  if (value.category === "CUSTOM" && !value.customCategory) {
    context.addIssue({
      code: "custom",
      path: ["customCategory"],
      message: "Enter a custom category",
    });
  }
});

export type DecisionFormValues = z.infer<typeof decisionSchema>;
