import { Router } from "express";
import { UserRole } from "@prisma/client";

import {
    inviteClient,
    registerClient,
    getPendingClientInvitations,
    cancelClientInvitation,
} from "../controllers/clientInvitation.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import { inviteEmailSchema } from "../validators/invitation.validator";

const router = Router();

router.post(
    "/projects/:projectId/invite-client",
    authenticate,
    authorize(UserRole.OWNER),
    validate(inviteEmailSchema),
    inviteClient
);

router.post(
    "/client/register",
    registerClient
);

router.get(
    "/projects/:projectId/client-invitations",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    getPendingClientInvitations
);

router.delete(
    "/projects/:projectId/client-invitations/:invitationId",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    cancelClientInvitation
);

export default router;