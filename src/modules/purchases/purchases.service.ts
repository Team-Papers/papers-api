import prisma from '../../config/database';
import { PurchasesRepository } from './purchases.repository';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors/app-error';
import { BookStatus, PurchaseStatus } from '../../generated/prisma/enums';
import { notificationsService } from '../notifications/notifications.service';
import type { CreatePurchaseDto } from './purchases.dto';
import type { PaginationQuery } from '../../shared/utils/pagination';

const COMMISSION_RATE = 0.3;

export class PurchasesService {
  private purchasesRepository: PurchasesRepository;

  constructor() {
    this.purchasesRepository = new PurchasesRepository();
  }

  async create(userId: string, data: CreatePurchaseDto) {
    const book = await prisma.book.findUnique({ where: { id: data.bookId } });
    if (!book || book.status !== BookStatus.PUBLISHED) {
      throw new NotFoundError('Book');
    }

    const existing = await this.purchasesRepository.findByUserAndBook(userId, data.bookId);
    if (existing) {
      throw new ConflictError('You have already purchased this book');
    }

    return this.purchasesRepository.create(
      userId,
      data.bookId,
      Number(book.price),
      data.paymentMethod,
    );
  }

  async getMyPurchases(userId: string, query: PaginationQuery) {
    return this.purchasesRepository.findByUserId(userId, query);
  }

  async getById(userId: string, purchaseId: string) {
    const purchase = await this.purchasesRepository.findById(purchaseId);
    if (!purchase || purchase.userId !== userId) {
      throw new NotFoundError('Purchase');
    }
    return purchase;
  }

  async mockComplete(purchaseId: string) {
    const purchase = await this.purchasesRepository.findById(purchaseId);
    if (!purchase) {
      throw new NotFoundError('Purchase');
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestError('Purchase is not pending');
    }

    const amount = Number(purchase.amount);
    const commission = amount * COMMISSION_RATE;
    const netAmount = amount - commission;

    await prisma.$transaction(async (tx) => {
      await tx.purchase.update({
        where: { id: purchaseId },
        data: { status: 'COMPLETED', paymentRef: `MOCK-${Date.now()}` },
      });

      await tx.userLibrary.create({
        data: { userId: purchase.userId, bookId: purchase.bookId },
      });

      await tx.authorTransaction.create({
        data: {
          authorId: purchase.book.authorId,
          type: 'SALE',
          amount,
          commission,
          netAmount,
          bookId: purchase.bookId,
          purchaseId: purchase.id,
          status: 'COMPLETED',
        },
      });

      await tx.authorProfile.update({
        where: { id: purchase.book.authorId },
        data: { balance: { increment: netAmount } },
      });
    });

    // Send notifications after successful transaction
    // Notify the buyer that their purchase is complete
    await notificationsService.notifyPurchaseComplete(
      purchase.userId,
      purchase.book.title,
      purchase.book.id,
    );

    // Notify the author about the new sale
    if (purchase.book.author) {
      await notificationsService.notifyNewSale(
        purchase.book.author.userId,
        purchase.book.title,
        purchase.book.id,
        netAmount,
      );
    }

    return this.purchasesRepository.findById(purchaseId);
  }
}
