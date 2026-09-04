import { ProjectClientRepository } from "../repositories/projectClient.repository";

export class ProjectClientService {
    private projectClientRepository =
        new ProjectClientRepository();

async getClientProjects(
    clientId: string,
    tenantId: string
) {
    return this.projectClientRepository.getProjectsForClient(
        clientId,
        tenantId
    );
}

    async getClientProject(
        clientId: string,
        projectId: string
    ) {
        const project =
            await this.projectClientRepository.findClientProject(
                clientId,
                projectId
            );

        if (!project) {
            throw new Error(
                "You do not have access to this project."
            );
        }

        return project.project;
    }
    async getProjectClients(projectId: string) {
    const clients =
        await this.projectClientRepository.findByProject(projectId);

    return clients.map(item => item.client);
}

async removeClient(
    projectId: string,
    clientId: string
) {
    const exists =
        await this.projectClientRepository.exists(
            projectId,
            clientId
        );

    if (!exists) {
        throw new Error("Client is not assigned to this project.");
    }

    await this.projectClientRepository.remove(
        projectId,
        clientId
    );

    return {
        message: "Client removed successfully.",
    };
}
}