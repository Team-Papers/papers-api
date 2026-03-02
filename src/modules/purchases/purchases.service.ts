import prisma from '../../config/database';
import { PurchasesRepository } from './purchases.repository';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors/app-error';
import { BookStatus, PurchaseStatus } from '../../generated/prisma/enums';
import { notificationsService } from '../notifications/notifications.service';
import { wechangoService } from '../wechango/wechango.service';
import { getUserFriendlyMessage } from '../wechango/wechango.types';
import { env } from '../../config/env';
import type { CreatePurchaseDto } from './purchases.dto';
import type { PaginationQuery } from '../../shared/utils/pagination';

const COMMISSION_RATE = 0.3;

export class PurchasesService {
  private purchasesRepository: PurchasesRepository;

  constructor() {
    this.purchasesRepository = new PurchasesRepository();
  }

  async create(userId: string, data: CreatePurchaseDto) {
    const book = await prisma.book.findUnique({
      where: { id: data.bookId },
      include: { author: { select: { penName: true } } },
    });
    if (!book || book.status !== BookStatus.PUBLISHED) {
      throw new NotFoundError('Book');
    }

    const existing = await this.purchasesRepository.findByUserAndBook(userId, data.bookId);
    if (existing) {
      throw new ConflictError('You have already purchased this book');
    }

    // Format phone number with country code if needed
    const phone = data.phoneNumber.startsWith('+') ? data.phoneNumber : `+237${data.phoneNumber}`;

    // Create purchase in PENDING state
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        bookId: data.bookId,
        amount: Number(book.price),
        paymentMethod: data.paymentMethod,
        phoneNumber: phone,
        status: 'PENDING',
      },
      include: {
        book: {
          select: { id: true, title: true, slug: true, coverUrl: true, price: true },
        },
      },
    });

    // Initiate Wechango payment
    try {
      const wechangoPayment = await wechangoService.createPayment(
        {
          amount: Number(book.price),
          currency: 'XAF',
          customer_phone: phone,
          country: 'CM',
          description: `Achat: ${book.title}`,
          reference: purchase.id,
          metadata: {
            purchase_id: purchase.id,
            book_id: book.id,
            user_id: userId,
          },
        },
        purchase.id, // Idempotency key = purchase ID
      );

      // Store Wechango payment ID and detected operator
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          paymentRef: wechangoPayment.id,
          operator: wechangoPayment.operator,
        },
      });

      return {
        ...purchase,
        paymentRef: wechangoPayment.id,
        operator: wechangoPayment.operator,
        wechangoStatus: wechangoPayment.status,
      };
    } catch (err) {
      // Mark purchase as failed if Wechango call fails
      const failureMessage = getUserFriendlyMessage('INIT_ERROR', null);
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'FAILED',
          failureCode: 'INIT_ERROR',
          failureMessage,
        },
      });
      throw new BadRequestError(failureMessage);
    }
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

  async getStatus(userId: string, purchaseId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: {
        id: true,
        userId: true,
        status: true,
        paymentRef: true,
        failureCode: true,
        failureMessage: true,
        createdAt: true,
      },
    });

    if (!purchase || purchase.userId !== userId) {
      throw new NotFoundError('Purchase');
    }

    // If still PENDING and has a Wechango paymentRef, check Wechango directly
    if (purchase.status === 'PENDING' && purchase.paymentRef) {
      try {
        const wechangoPayment = await wechangoService.getPayment(purchase.paymentRef);

        if (wechangoPayment.status === 'succeeded') {
          // Attempt to complete — wrapped in try/catch to handle race with webhook
          try {
            const freshPurchase = await prisma.purchase.findUnique({
              where: { id: purchaseId },
              select: { status: true },
            });

            if (freshPurchase?.status === 'PENDING') {
              const fullPurchase = await this.purchasesRepository.findById(purchaseId);
              if (fullPurchase) {
                await this.completePurchase(fullPurchase);
              }
            }
          } catch (err) {
            // Race condition with webhook — completePurchase likely ran from webhook
            console.log(`[getStatus] completePurchase race handled for ${purchaseId}:`, err);
          }

          return {
            id: purchase.id,
            status: 'COMPLETED',
            failureCode: null,
            failureMessage: null,
            createdAt: purchase.createdAt,
          };
        }

        if (wechangoPayment.status === 'failed' || wechangoPayment.status === 'cancelled') {
          const code = wechangoPayment.failure_code ?? 'PAYMENT_FAILED';
          const message = getUserFriendlyMessage(code, wechangoPayment.failure_message);
          await prisma.purchase.update({
            where: { id: purchaseId },
            data: {
              status: 'FAILED',
              failureCode: code,
              failureMessage: message,
            },
          });
          return {
            id: purchase.id,
            status: 'FAILED',
            failureCode: code,
            failureMessage: message,
            createdAt: purchase.createdAt,
          };
        }
      } catch (err) {
        // If Wechango API is unreachable, return current DB status
        console.error('[getStatus] Wechango check failed:', err);
      }
    }

    return {
      id: purchase.id,
      status: purchase.status,
      failureCode: purchase.failureCode,
      failureMessage: purchase.failureMessage,
      createdAt: purchase.createdAt,
    };
  }

  /**
   * Dev/test only: simulate payment completion without Wechango.
   * Disabled in production.
   */
  async mockComplete(purchaseId: string) {
    if (env.NODE_ENV === 'production') {
      throw new BadRequestError('Mock complete is not available in production');
    }

    const purchase = await this.purchasesRepository.findById(purchaseId);
    if (!purchase) {
      throw new NotFoundError('Purchase');
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestError('Purchase is not pending');
    }

    await this.completePurchase(purchase);
    return this.purchasesRepository.findById(purchaseId);
  }

  /**
   * Core completion logic — used by both webhook and mockComplete.
   */
  async completePurchase(purchase: {
    id: string;
    userId: string;
    bookId: string;
    amount: { toNumber?: () => number } | number;
    book: { authorId: string; title: string; id: string; author?: { userId: string } | null };
  }) {
    const amount = typeof purchase.amount === 'number' ? purchase.amount : Number(purchase.amount);
    const commission = amount * COMMISSION_RATE;
    const netAmount = amount - commission;

    await prisma.$transaction(async (tx) => {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: 'COMPLETED' },
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

    // Notifications
    await notificationsService.notifyPurchaseComplete(
      purchase.userId,
      purchase.book.title,
      purchase.book.id,
    );

    if (purchase.book.author) {
      await notificationsService.notifyNewSale(
        purchase.book.author.userId,
        purchase.book.title,
        purchase.book.id,
        netAmount,
      );
    }
  }
}
