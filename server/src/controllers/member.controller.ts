import { Request, Response } from "express";
import { MemberService } from "../services/member.service";
import { setRefreshCookie } from "../auth/cookies";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const memberService = new MemberService();

export async function inviteMember(
    req: AuthenticatedRequest,
    res: Response
) {
    try {

        const { email } = req.body;

        const result = await memberService.inviteMember(
            email,
            req.user!.tenantId,
            req.user!.userId
        );

        return res.status(201).json({
            success: true,
            message: result.message,
            data: result
        });

    } catch (error: any) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
    
}


export async function registerFromInvitation(
    req: Request,
    res: Response
) {

    try {

        const {
            token,
            name,
            password
        } = req.body;

        const { refreshToken, ...data } =
            await memberService.registerFromInvitation(
                token,
                name,
                password
            );

        setRefreshCookie(res, refreshToken);

        return res.status(201).json({
            success: true,
            message: data.message,
            data
        });

    } catch (error: any) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}

export async function getInvitations(
    req: AuthenticatedRequest,
    res: Response
) {

    try {

        const invitations =
            await memberService.getInvitations(
                req.user!.tenantId
            );

        return res.status(200).json({
            success: true,
            data: invitations
        });

    } catch (error: any) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}
export async function getWorkspaceMembers(
    req: AuthenticatedRequest,
    res: Response
) {

    try {

        const members =
            await memberService.getWorkspaceMembers(
                req.user!.tenantId
            );

        return res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

}
export async function deleteInvitation(
    req: Request,
    res: Response
) {

    try {

        const id = String(req.params.id);

        await memberService.deleteInvitation(id);

        return res.status(200).json({
            success: true,
            message: "Invitation deleted successfully."
        });

    } catch (error: any) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}