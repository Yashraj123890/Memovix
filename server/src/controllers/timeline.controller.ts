import { Request, Response } from "express";
import { TimelineService } from "../services/timeline.service";

export class TimelineController {
    private timelineService = new TimelineService();

    async getProjectTimeline(req: Request, res: Response) {
        try {
            const projectId = req.params.projectId as string;

            const timeline = await this.timelineService.getProjectTimeline(projectId);

            return res.status(200).json({
                success: true,
                message: "Timeline fetched successfully",
                data: timeline,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch timeline",
            });
        }
    }
}