import { z } from "zod";

/**
 * Mirrors the backend's actual validation: MemoryService.createMemory
 * (server/src/services/memory.service.ts) only rejects a title/content
 * that's empty after trimming — same "no minimum length beyond that"
 * shape as createProjectSchema. CUSTOM is a form-only value: the API stores
 * it as category OTHER plus the user's actual customCategory label.
 */
export const memorySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  category: z.enum([
    "NOTE",
    "DECISION",
    "MEETING",
    "FEATURE",
    "BUG",
    "API",
    "DOCUMENTATION",
    "CUSTOM",
  ]),
  customCategory: z.string().trim().max(50, "Use 50 characters or fewer"),
}).superRefine((value, context) => {
  if (value.category === "CUSTOM" && !value.customCategory) {
    context.addIssue({
      code: "custom",
      path: ["customCategory"],
      message: "Enter a custom category",
    });
  }
});

export type MemoryFormValues = z.infer<typeof memorySchema>;
