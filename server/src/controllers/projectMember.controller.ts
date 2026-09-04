import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { ProjectMemberService } from "../services/projectMember.service";

const projectMemberService = new ProjectMemberService();

export class ProjectMemberController {

  async getProjectMembers(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;

      const members = await projectMemberService.getProjectMembers(projectId);

      return res.status(200).json({
        success: true,
        count: members.length,
        data: members,
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
     const projectId = req.params.projectId as string;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

    const tenantId = (req as any).user.tenantId;

const member =
    await projectMemberService.addMember(
        projectId,
        userId,
        UserRole.MEMBER,
        tenantId
    );

      return res.status(201).json({
        success: true,
        message: "Member added successfully.",
        data: member,
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const  userId  = req.params.userId as string;
  const projectId = req.params.projectId as string;
   
      await projectMemberService.removeMember(
        projectId,
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Member removed successfully.",
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new ProjectMemberController();