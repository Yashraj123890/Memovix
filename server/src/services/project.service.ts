import { ProjectStatus, UserRole } from "@prisma/client";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectClientRepository } from "../repositories/projectClient.repository";

export class ProjectService {
    private projectRepository = new ProjectRepository();
    private projectClientRepository = new ProjectClientRepository();

    async createProject(data: {
        tenantId: string;
        ownerId: string;
        name: string;
        description?: string;
    }) {
        if (!data.name.trim()) {
            throw new Error("Project name is required");
        }

        return this.projectRepository.create(data);
    }

    async getProjects(
        tenantId: string,
        userId: string,
        role: UserRole
    ) {
        if (role === UserRole.CLIENT) {
            return this.projectClientRepository.getProjectsForClient(
    userId,
    tenantId
);
        }

        return this.projectRepository.findAllByTenant(tenantId);
    }

    async getProjectById(projectId: string, tenantId: string) {
        return this.projectRepository.findById(projectId, tenantId);
    }

    async updateProject(
        projectId: string,
        tenantId: string,
        data: {
            name?: string;
            description?: string;
            status?: ProjectStatus;
        }
    ) {
        return this.projectRepository.update(
            projectId,
            tenantId,
            data
        );
    }

    async deleteProject(projectId: string, tenantId: string) {
        return this.projectRepository.delete(projectId, tenantId);
    }
}