import { NotificationType } from "@prisma/client";
import notificationRepository from "../repositories/notification.repository";

class NotificationService {
  async createNotification(data: {
  userId: string;
  projectId?: string;
  type: NotificationType;
  title: string;
  message: string;
}) {
  console.log("NotificationService:", data);

  return notificationRepository.create(data);
}

  async getNotifications(userId: string) {
    return notificationRepository.findByUser(userId);
  }

  async getUnreadNotifications(userId: string) {
    return notificationRepository.findUnread(userId);
  }

  async markAsRead(id: string) {
    return notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }
  
}

export default new NotificationService();