import { UserRole } from "@prisma/client";

import { ProjectMemberRepository } from "../repositories/projectMemberRepository";
import { AuthRepository } from "../repositories/auth.repository";

export class ProjectMemberService {
  private projectMemberRepository = new ProjectMemberRepository();
  private authRepository = new AuthRepository();

  async addMember(
    projectId: string,
    userId: string,
    role: UserRole,
    tenantId: string
  ) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.tenantId !== tenantId) {
      throw new Error("User does not belong to this tenant.");
    }

    const existingMember =
      await this.projectMemberRepository.findMember(
        projectId,
        userId
      );

    if (existingMember) {
      throw new Error("User is already a member of this project.");
    }

    return this.projectMemberRepository.create(
      projectId,
      userId,
      role
    );
  }

  async getProjectMembers(projectId: string) {
    return this.projectMemberRepository.findByProject(projectId);
  }

  async removeMember(
    projectId: string,
    userId: string
  ) {
    return this.projectMemberRepository.remove(
      projectId,
      userId
    );
  }
}