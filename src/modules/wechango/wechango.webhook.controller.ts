import { Request, Response } from 'express';
import prisma from '../../config/database';
import { wechangoService } from './wechango.service';
import { notificationsService } from '../notifications/notifications.service';

const COMMISSION_RATE = 0.3;

export class WechangoWebhookController {
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const rawBody = (req.body as Buffer).toString();
    const signatureHeader = req.headers['wechango-signature'] as string | undefined;

    // Verify HMAC signature if webhook secret is configured
    if (signatureHeader) {
      const isValid = wechangoService.verifyWebhookSignature(rawBody, signatureHeader);
      if (!isValid) {
        console.error('[Wechango Webhook] Invalid signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    }

    const event = wechangoService.parseWebhookEvent(rawBody);
    console.log(`[Wechango Webhook] Received: ${event.type} for ${event.data.payment_id}`);

    // Respond 200 immediately
    res.status(200).json({ received: true });

    // Process asynchronously
    try {
      switch (event.type) {
        case 'payment.succeeded':
          await this.handlePaymentSucceeded(event.data.payment_id);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(
            event.data.payment_id,
            event.data.failure_code,
            event.data.failure_message,
          );
          break;
      }
    } catch (err) {
      console.error(`[Wechango Webhook] Processing error:`, err);
    }
  }

  private async handlePaymentSucceeded(wechangoPaymentId: string) {
    const purchase = await prisma.purchase.findFirst({
      where: { paymentRef: wechangoPaymentId, status: 'PENDING' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            authorId: true,
            author: { select: { userId: true } },
          },
        },
      },
    });

    if (!purchase) {
      console.log(`[Wechango Webhook] No pending purchase found for ${wechangoPaymentId}`);
      return;
    }

    const amount = Number(purchase.amount);
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

    console.log(`[Wechango Webhook] Purchase ${purchase.id} completed successfully`);
  }

  private async handlePaymentFailed(
    wechangoPaymentId: string,
    failureCode?: string,
    failureMessage?: string,
  ) {
    const purchase = await prisma.purchase.findFirst({
      where: { paymentRef: wechangoPaymentId, status: 'PENDING' },
    });

    if (!purchase) {
      console.log(`[Wechango Webhook] No pending purchase found for ${wechangoPaymentId}`);
      return;
    }

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'FAILED',
        failureCode: failureCode ?? null,
        failureMessage: failureMessage ?? null,
      },
    });

    console.log(
      `[Wechango Webhook] Purchase ${purchase.id} failed: ${failureCode} — ${failureMessage}`,
    );
  }
}
