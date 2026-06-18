import { prisma } from '../../database/prisma';
import { getPaginationParams, paginate } from '../../utils/response';

interface CreateNotificationDto {
  userId: string;
  title: string;
  body: string;
  type: string;
  referenceId?: string;
  referenceType?: string;
}

export class NotificationsService {
  async create(dto: CreateNotificationDto) {
    return prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type,
        referenceId: dto.referenceId ?? null,
        referenceType: dto.referenceType ?? null,
        sentAt: new Date(),
      },
    });
  }

  async getUserNotifications(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);
    const unreadOnly = query.unread === 'true';

    const where = {
      userId,
      ...(unreadOnly && { isRead: false }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return paginate(notifications, total, { page, limit, skip });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
}

export const notificationsService = new NotificationsService();
