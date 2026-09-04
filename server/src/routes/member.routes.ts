import { Router } from "express";

import {
    inviteMember,
    registerFromInvitation,
    getInvitations,
    getWorkspaceMembers,
    deleteInvitation
} from "../controllers/member.controller";

import {
    authenticate,
    authorize
} from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { inviteEmailSchema } from "../validators/invitation.validator";



const router = Router();

router.post(
    "/invite",
    authenticate,
    authorize("OWNER"),
    validate(inviteEmailSchema),
    inviteMember
);

router.post(
    "/register",
    registerFromInvitation
);

router.get(
    "/",
    authenticate,
    authorize("OWNER"),
    getInvitations
);

router.delete(
    "/:id",
    authenticate,
    authorize("OWNER"),
    deleteInvitation
);

router.get(
    "/workspace",
    authenticate,
    getWorkspaceMembers
);

export default router;