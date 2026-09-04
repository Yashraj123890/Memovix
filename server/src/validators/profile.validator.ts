import { z } from "zod";

/**
 * Body for PATCH /users/me/profile. Both fields optional so the client can
 * update either independently; empty strings are allowed and normalized to the
 * not-set state in the service. `.nullish()` accepts string | null | undefined.
 */
export const updateProfileSchema = z
    .object({
        title: z.string().trim().max(100, "Title is too long").nullish(),
        about: z.string().trim().max(1000, "About is too long").nullish(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "No fields to update",
    });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
