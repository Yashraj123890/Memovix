import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type RequestPart = "body" | "params" | "query";

/**
 * Reusable Zod validation middleware (blueprint §13.3 — "every request body,
 * query parameter, and route parameter is validated against a Zod schema
 * before it reaches business logic"). On success the parsed/coerced value
 * replaces the raw input (except `req.query`, which is a read-only getter in
 * Express 5); on failure it returns a 400 with a structured error list in the
 * app's standard `{ success, message }` envelope.
 */
export const validate =
  (schema: ZodType, source: RequestPart = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (source !== "query") {
      (req as unknown as Record<RequestPart, unknown>)[source] = result.data;
    }

    next();
  };
