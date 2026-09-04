    import { Router } from "express";
    import { authenticate } from "../middleware/auth.middleware";
    import { CommentController } from "../controllers/comment.controller";
    import { checkProjectAccess } from "../middleware/projectAccess.middleware";

    const router = Router();
    const commentController = new CommentController();

   router.post(
    "/",
    authenticate,
    checkProjectAccess,
    commentController.createComment.bind(commentController)
);

router.get(
    "/memory/:memoryId",
    authenticate,
    checkProjectAccess,
    commentController.getMemoryComments.bind(commentController)
);

router.get(
    "/file/:fileId",
    authenticate,
    checkProjectAccess,
    commentController.getFileComments.bind(commentController)
);

router.put(
    "/:commentId",
    authenticate,
    checkProjectAccess,
    commentController.updateComment.bind(commentController)
);

router.delete(
    "/:commentId",
    authenticate,
    checkProjectAccess,
    commentController.deleteComment.bind(commentController)
);

    export default router;