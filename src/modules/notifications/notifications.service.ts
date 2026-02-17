import { NotificationsRepository } from './notifications.repository';
import {
  NotificationType,
  type NotificationQueryDto,
  type CreateNotificationData,
} from './notifications.dto';

export class NotificationsService {
  private notificationsRepository: NotificationsRepository;

  constructor() {
    this.notificationsRepository = new NotificationsRepository();
  }

  async getNotifications(userId: string, query: NotificationQueryDto) {
    return this.notificationsRepository.findByUserId(userId, query);
  }

  async getUnreadCount(userId: string) {
    return this.notificationsRepository.getUnreadCount(userId);
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationsRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  async deleteNotification(id: string, userId: string) {
    return this.notificationsRepository.delete(id, userId);
  }

  async clearReadNotifications(userId: string) {
    return this.notificationsRepository.deleteAllRead(userId);
  }

  // Helper methods for creating specific notification types
  async notifyBookApproved(userId: string, bookTitle: string, bookId: string) {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType.BOOK_APPROVED,
      title: 'Livre approuvé',
      message: `Votre livre "${bookTitle}" a été approuvé et est maintenant publié.`,
      data: { bookId },
    });
  }

  async notifyBookRejected(userId: string, bookTitle: string, bookId: string, reason: string) {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType.BOOK_REJECTED,
      title: 'Livre rejeté',
      message: `Votre livre "${bookTitle}" a été rejeté. Motif : ${reason}`,
      data: { bookId, reason },
    });
  }

  async notifyBookSubmitted(
    adminUserIds: string[],
    bookTitle: string,
    bookId: string,
    authorName: string,
  ) {
    const notifications: CreateNotificationData[] = adminUserIds.map((userId) => ({
      userId,
      type: NotificationType.BOOK_SUBMITTED,
      title: 'Nouveau livre soumis',
      message: `"${bookTitle}" par ${authorName} est en attente de validation.`,
      data: { bookId },
    }));
    return this.notificationsRepository.createMany(notifications);
  }

  async notifyAuthorApproved(userId: string) {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType.AUTHOR_APPROVED,
      title: 'Profil auteur approuvé',
      message:
        'Votre demande de profil auteur a été approuvée. Vous pouvez maintenant publier des livres.',
    });
  }

  async notifyAuthorRejected(userId: string, reason?: string) {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType.AUTHOR_REJECTED,
      title: 'Profil auteur rejeté',
      message: reason
        ? `Votre demande de profil auteur a été rejetée. Motif : ${reason}`
        : 'Votre demande de profil auteur a été rejetée.',
    });
  }

  async notifyNewSale(authorUserId: string, bookTitle: string, bookId: string, amount: number) {
    return this.notificationsRepository.create({
      userId: authorUserId,
      type: NotificationType.NEW_SALE,
      title: 'Nouvelle vente',
      message: `"${bookTitle}" a été acheté pour ${amount.toLocaleString('fr-FR')} FCFA.`,
      data: { bookId, amount },
    });
  }

  async notifyPurchaseComplete(userId: string, bookTitle: string, bookId: string) {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType.BOOK_PURCHASED,
      title: 'Achat confirmé',
      message: `Votre achat de "${bookTitle}" est confirmé. Le livre est disponible dans votre bibliothèque.`,
      data: { bookId },
    });
  }

  async notifyNewReview(authorUserId: string, bookTitle: string, bookId: string, rating: number) {
    return this.notificationsRepository.create({
      userId: authorUserId,
      type: NotificationType.NEW_REVIEW,
      title: 'Nouvel avis',
      message: `Un lecteur a laissé un avis ${rating}/5 sur "${bookTitle}".`,
      data: { bookId, rating },
    });
  }

  async notifyWithdrawalApproved(userId: string, amount: number) {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType.WITHDRAWAL_APPROVED,
      title: 'Retrait approuvé',
      message: `Votre demande de retrait de ${amount.toLocaleString('fr-FR')} FCFA a été approuvée.`,
      data: { amount },
    });
  }

  async notifyWithdrawalRejected(userId: string, amount: number, reason: string) {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType.WITHDRAWAL_REJECTED,
      title: 'Retrait rejeté',
      message: `Votre demande de retrait de ${amount.toLocaleString('fr-FR')} FCFA a été rejetée. Motif : ${reason}`,
      data: { amount, reason },
    });
  }

  async notifyWithdrawalCompleted(userId: string, amount: number) {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType.WITHDRAWAL_COMPLETED,
      title: 'Retrait effectué',
      message: `Votre retrait de ${amount.toLocaleString('fr-FR')} FCFA a été effectué avec succès.`,
      data: { amount },
    });
  }

  async notifyNewFollower(authorUserId: string, followerName: string) {
    return this.notificationsRepository.create({
      userId: authorUserId,
      type: NotificationType.NEW_FOLLOWER,
      title: 'Nouvel abonné',
      message: `${followerName} s'est abonné(e) à votre profil.`,
    });
  }

  async notifyFollowersNewBook(
    followerUserIds: string[],
    bookTitle: string,
    bookId: string,
    authorName: string,
  ) {
    if (followerUserIds.length === 0) return;
    const notifications: CreateNotificationData[] = followerUserIds.map((userId) => ({
      userId,
      type: NotificationType.AUTHOR_NEW_BOOK,
      title: 'Nouveau livre disponible',
      message: `${authorName} vient de publier "${bookTitle}".`,
      data: { bookId },
    }));
    return this.notificationsRepository.createMany(notifications);
  }

  async sendSystemAnnouncement(userIds: string[], title: string, message: string) {
    const notifications: CreateNotificationData[] = userIds.map((userId) => ({
      userId,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title,
      message,
    }));
    return this.notificationsRepository.createMany(notifications);
  }
}

// Export a singleton instance for use across the app
export const notificationsService = new NotificationsService();
