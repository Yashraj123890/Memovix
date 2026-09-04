import { Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ProjectClientRepository } from "../repositories/projectClient.repository";
import ragService from "../services/rag.service";
import { handleAiError } from "./ai-error.helper";
import { AiUnavailableError, wrapAiError } from "../ai/ai-error";
import { assessCitations } from "../ai/citation-check";

class RAGController {
  async ask(
  req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const projectClientRepository = new ProjectClientRepository();
    try {
     const { projectId, question } = req.body;

     if (!projectId || !question) {
  return res.status(400).json({
    success: false,
    message: "Project ID and question are required",
  });
}
if (req.user?.role === UserRole.CLIENT) {
    const assignment =
        await projectClientRepository.findClientProject(
            req.user.userId,
            projectId
        );

    if (!assignment) {
        return res.status(403).json({
            success: false,
            message: "Access denied",
        });
    }
}

     const result = await ragService.ask(
  projectId,
  question
);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleAiError(res, error);
    }
  }

  /**
   * POST /api/ai/ask/stream — Server-Sent Events variant (blueprint §8.8). CLIENT
   * project access is enforced by checkProjectAccess on the route. Grounding
   * (retrieval) runs before the SSE headers so a retrieval failure returns a
   * clean JSON error; once streaming starts, failures are emitted as an `error`
   * event. Events: `sources` (citations + confidence) → many `token` (deltas) →
   * `done`. `res.flush()` after each write defeats the compression middleware's
   * buffering so tokens arrive incrementally.
   */
  async askStream(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    const { projectId, question } = req.body;

    if (!projectId || !question) {
      return res.status(400).json({
        success: false,
        message: "Project ID and question are required",
      });
    }

    let streamResult;
    try {
      // Grounding happens before headers are sent — errors here → JSON, with a
      // clean 503 when the AI provider is unavailable (blueprint §4.4).
      streamResult = await ragService.askStream(projectId, question);
    } catch (error) {
      const mapped = wrapAiError(error);
      const status = mapped instanceof AiUnavailableError ? mapped.statusCode : 500;
      return res.status(status).json({ success: false, message: mapped.message });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      (res as unknown as { flush?: () => void }).flush?.();
    };

    let aborted = false;
    req.on("close", () => {
      aborted = true;
    });

    try {
      send("sources", {
        sources: streamResult.sources,
        confidence: streamResult.confidence,
      });

      let answer = "";
      for await (const delta of streamResult.stream) {
        if (aborted) break;
        answer += delta;
        send("token", { delta });
      }

      if (!aborted) {
        // Citation-compliance metric on the assembled answer (blueprint §8.8/§11):
        // the confidence was sent up front, so the final adjusted value + uncited
        // flag are delivered here. Never modifies the streamed text.
        const assessment = assessCitations(answer, streamResult.confidence);
        if (assessment.uncited) {
          console.warn(
            `[RAGController] Uncited streamed answer (model omitted [Source: N]) for project ${projectId}: "${String(question).slice(0, 80)}"`,
          );
        }
        send("meta", { uncited: assessment.uncited, confidence: assessment.confidence });
        send("done", {});
      }
    } catch (error) {
      console.error("AI stream error:", error);
      if (!aborted) {
        // Once streaming has started we can't change the status code, so the
        // failure is delivered as an `error` event — with the same clean
        // "AI temporarily unavailable" message when the provider dropped.
        const mapped = wrapAiError(error);
        send("error", { message: mapped.message });
      }
    } finally {
      res.end();
    }
  }
}

export default new RAGController();