import { Router } from "express";
import semanticSearchController from "../controllers/semanticSearch.controller";
import { authenticate } from "../middleware/auth.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";

const router = Router();

router.post(
    "/search",
    authenticate,
    checkProjectAccess,
    semanticSearchController.search
);

export default router;