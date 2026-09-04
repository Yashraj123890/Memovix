import { Request, Response } from "express";
import { ClientInvitationService } from "../services/clientInvitation.service";
import { setRefreshCookie } from "../auth/cookies";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
// import { Request, Response } from "express";
const clientInvitationService = new ClientInvitationService();

export async function inviteClient(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
       const projectId = String(req.params.projectId);
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

       const result = await clientInvitationService.inviteClient(
    req.user!.userId,
    projectId,
    email
);
        return res.status(201).json({
            success: true,
            message: result.message,
            data: result.invitation,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
export async function registerClient(
    req: Request,
    res: Response
) {
    try {
        const { refreshToken, ...data } =
            await clientInvitationService.registerClient(req.body);

        setRefreshCookie(res, refreshToken);

        return res.status(201).json({
            success: true,
            message: "Client registered successfully.",
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
export async function getPendingClientInvitations(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const projectId = req.params.projectId as string;

        const invitations =
            await clientInvitationService.getPendingInvitations(
                projectId
            );

        return res.status(200).json({
            success: true,
            data: invitations,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function cancelClientInvitation(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const invitationId = req.params.invitationId as string;

        const result =
            await clientInvitationService.cancelInvitation(
                invitationId
            );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}