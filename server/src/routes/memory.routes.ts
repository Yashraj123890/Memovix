import { Router } from "express";
import { MemoryController } from "../controllers/memory.controller";
import { authenticate } from "../middleware/auth.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";

const router = Router();
const memoryController = new MemoryController();

router.post(
    "/",
    authenticate,
    checkProjectAccess,
    memoryController.createMemory.bind(memoryController)
);

router.get(
    "/project/:projectId",
    authenticate,
    checkProjectAccess,
    memoryController.getProjectMemories.bind(memoryController)
);

router.get(
    "/:memoryId",
    authenticate,
    checkProjectAccess,
    memoryController.getMemoryById.bind(memoryController)
);

router.put(
    "/:memoryId",
    authenticate,
    checkProjectAccess,
    memoryController.updateMemory.bind(memoryController)
);

router.delete(
    "/:memoryId",
    authenticate,
    checkProjectAccess,
    memoryController.deleteMemory.bind(memoryController)
);

router.get(
    "/search/query",
    authenticate,
    memoryController.searchMemories.bind(memoryController)
);

export default router;