import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  notificationController.getNotifications
);

router.get(
  "/unread",
  notificationController.getUnreadNotifications
);

router.patch(
  "/:id/read",
  notificationController.markAsRead
);

router.patch(
  "/read-all",
  notificationController.markAllAsRead
);

export default router;