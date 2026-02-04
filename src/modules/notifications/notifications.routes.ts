import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new NotificationsController();

// All routes require authentication
router.use(authenticate);

// Get all notifications (paginated)
router.get('/', (req, res, next) => {
  controller.getNotifications(req, res).catch(next);
});

// Get unread count
router.get('/unread-count', (req, res, next) => {
  controller.getUnreadCount(req, res).catch(next);
});

// Mark all as read
router.post('/mark-all-read', (req, res, next) => {
  controller.markAllAsRead(req, res).catch(next);
});

// Clear all read notifications
router.delete('/clear-read', (req, res, next) => {
  controller.clearReadNotifications(req, res).catch(next);
});

// Mark single notification as read
router.patch('/:id/read', (req, res, next) => {
  controller.markAsRead(req, res).catch(next);
});

// Delete single notification
router.delete('/:id', (req, res, next) => {
  controller.deleteNotification(req, res).catch(next);
});

export default router;
