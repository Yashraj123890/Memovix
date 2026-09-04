import { TimelineRepository } from "../repositories/timelineRepository";

export class TimelineService {
    private timelineRepository = new TimelineRepository();

    async createEvent(data: {
        projectId: string;
        userId?: string;
        action: string;
        description: string;
    }) {
        return this.timelineRepository.create(data);
    }

    async getProjectTimeline(projectId: string) {
        return this.timelineRepository.findAllByProject(projectId);
    }
}