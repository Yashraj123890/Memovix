import { Router } from "express";
import ragController from "../controllers/rag.controller";
import { authenticate } from "../middleware/auth.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";

const router = Router();

router.post(
    "/ask",
    authenticate,
    checkProjectAccess,
    ragController.ask
);

router.post(
    "/ask/stream",
    authenticate,
    checkProjectAccess,
    ragController.askStream
);

export default router;