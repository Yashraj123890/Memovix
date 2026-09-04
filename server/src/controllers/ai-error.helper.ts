import { Response } from "express";
import { AiUnavailableError, wrapAiError } from "../ai/ai-error";

/**
 * Shared error responder for AI controllers. AI-provider failures become a
 * consistent 503 "AI is temporarily unavailable"; everything else keeps the
 * same 404 ("not found") / 400 mapping the AI controllers already used. Safe to
 * use on non-AI handlers too — a plain application error just falls through to
 * the 404/400 branch.
 */
export function handleAiError(res: Response, error: unknown) {
  const mapped = wrapAiError(error);

  if (mapped instanceof AiUnavailableError) {
    return res.status(mapped.statusCode).json({
      success: false,
      message: mapped.message,
    });
  }

  const message = mapped.message || "Something went wrong";
  const status = /not found/i.test(message) ? 404 : 400;
  return res.status(status).json({ success: false, message });
}
