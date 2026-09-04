import { Request, Response, NextFunction } from "express";
import semanticSearchService from "../services/semanticSearch.service";

class SemanticSearchController {
  async search(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
     const { projectId, query, limit } = req.body;

      if (!query) {
    return res.status(400).json({
        success: false,
        message: "Query is required",
    });
}

if (!projectId) {
    return res.status(400).json({
        success: false,
        message: "Project ID is required",
    });
}

    const results = await semanticSearchService.search(
    projectId,
    query,
    limit || 5
);

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }

  }
}

export default new SemanticSearchController();