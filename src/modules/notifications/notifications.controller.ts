import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { notificationQueryDto } from './notifications.dto';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

const notificationsService = new NotificationsService();

export class NotificationsController {
  async getNotifications(req: Request, res: Response) {
    const query = notificationQueryDto.parse(req.query);
    const { notifications, total } = await notificationsService.getNotifications(
      req.user!.userId,
      query,
    );
    sendPaginated(res, notifications, { page: query.page, limit: query.limit, total });
  }

  async getUnreadCount(req: Request, res: Response) {
    const count = await notificationsService.getUnreadCount(req.user!.userId);
    sendSuccess(res, { count });
  }

  async markAsRead(req: Request, res: Response) {
    await notificationsService.markAsRead(req.params.id as string, req.user!.userId);
    sendSuccess(res, { message: 'Notification marked as read' });
  }

  async markAllAsRead(req: Request, res: Response) {
    await notificationsService.markAllAsRead(req.user!.userId);
    sendSuccess(res, { message: 'All notifications marked as read' });
  }

  async deleteNotification(req: Request, res: Response) {
    await notificationsService.deleteNotification(req.params.id as string, req.user!.userId);
    sendSuccess(res, { message: 'Notification deleted' });
  }

  async clearReadNotifications(req: Request, res: Response) {
    await notificationsService.clearReadNotifications(req.user!.userId);
    sendSuccess(res, { message: 'Read notifications cleared' });
  }
}
