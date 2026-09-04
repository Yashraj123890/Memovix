import { z } from "zod";
import { MemoryCategory } from "@prisma/client";

export const createMemorySchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    category: z.nativeEnum(MemoryCategory),
    customCategory: z.string().trim().min(1).max(50).optional(),
    projectId: z.string().min(1),
}).superRefine((value, context) => {
    if (value.category === MemoryCategory.OTHER && !value.customCategory) {
        context.addIssue({
            code: "custom",
            path: ["customCategory"],
            message: "Custom category is required",
        });
    }
});

export const updateMemorySchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    category: z.nativeEnum(MemoryCategory).optional(),
    customCategory: z.string().trim().min(1).max(50).nullable().optional(),
}).superRefine((value, context) => {
    if (value.category === MemoryCategory.OTHER && !value.customCategory) {
        context.addIssue({
            code: "custom",
            path: ["customCategory"],
            message: "Custom category is required",
        });
    }
});
