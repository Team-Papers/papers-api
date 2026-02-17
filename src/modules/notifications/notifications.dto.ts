import { z } from 'zod/v4';

export const notificationQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().optional(),
});

export type NotificationQueryDto = z.infer<typeof notificationQueryDto>;

// Notification types enum
export enum NotificationType {
  // Book events
  BOOK_APPROVED = 'BOOK_APPROVED',
  BOOK_REJECTED = 'BOOK_REJECTED',
  BOOK_SUBMITTED = 'BOOK_SUBMITTED',

  // Author events
  AUTHOR_APPROVED = 'AUTHOR_APPROVED',
  AUTHOR_REJECTED = 'AUTHOR_REJECTED',

  // Purchase events
  BOOK_PURCHASED = 'BOOK_PURCHASED',
  NEW_SALE = 'NEW_SALE',

  // Review events
  NEW_REVIEW = 'NEW_REVIEW',

  // Follow events
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  AUTHOR_NEW_BOOK = 'AUTHOR_NEW_BOOK',

  // Withdrawal events
  WITHDRAWAL_APPROVED = 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED = 'WITHDRAWAL_REJECTED',
  WITHDRAWAL_COMPLETED = 'WITHDRAWAL_COMPLETED',

  // System events
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  ACCOUNT_WARNING = 'ACCOUNT_WARNING',
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
}
