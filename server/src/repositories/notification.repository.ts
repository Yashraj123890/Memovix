import prisma from "../lib/prisma";
import { NotificationType } from "@prisma/client";

class NotificationRepository {
  async create(data: {
  userId: string;
  projectId?: string;
  type: NotificationType;
  title: string;
  message: string;
}) {
  console.log("NotificationRepository:", data);

  return prisma.notification.create({
    data,
  });
}

  async findByUser(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findUnread(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}

export default new NotificationRepository();