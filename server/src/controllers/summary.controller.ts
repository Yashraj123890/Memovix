import { Request, Response } from "express";
import summaryService from "../services/summary.service";
import { handleAiError } from "./ai-error.helper";

class SummaryController {
  async generate(
    req: Request,
    res: Response
  ) {
    try {
      const { projectId, projectName } = req.body;

      if (!projectId || !projectName) {
        return res.status(400).json({
          success: false,
          message: "Project ID and project name are required.",
        });
      }

      const result = await summaryService.generate(
        projectId,
        projectName
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleAiError(res, error);
    }
  }
}

export default new SummaryController();