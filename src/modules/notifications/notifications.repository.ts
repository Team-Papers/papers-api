import prisma from '../../config/database';
import type { NotificationQueryDto, CreateNotificationData } from './notifications.dto';

export class NotificationsRepository {
  async create(data: CreateNotificationData) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data as any,
      },
    });
  }

  async createMany(notifications: CreateNotificationData[]) {
    return prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data as any,
      })),
    });
  }

  async findByUserId(userId: string, query: NotificationQueryDto) {
    const { page, limit, unreadOnly } = query;
    const skip = (page - 1) * limit;

    const where: { userId: string; read?: boolean } = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  async deleteAllRead(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId, read: true },
    });
  }
}
