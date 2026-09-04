import { Request, Response, NextFunction } from "express";
import notificationService from "../services/notification.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

class NotificationController {
  async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notifications =
        await notificationService.getNotifications(req.user!.userId);

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notifications =
        await notificationService.getUnreadNotifications(req.user!.userId);

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const notification =
            await notificationService.markAsRead(req.params.id as string);

        return res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
}

  async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();