import { Router } from "express";
import {
    healthCheck,
    healthDb,
    healthAi,
} from "../controllers/health.controller";

const router = Router();

router.get("/", healthCheck);
router.get("/db", healthDb);
router.get("/ai", healthAi);

export default router;
