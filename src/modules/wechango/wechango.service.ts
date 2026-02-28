import crypto from 'crypto';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';
import type {
  WechangoCreatePaymentParams,
  WechangoPayment,
  WechangoWebhookEvent,
} from './wechango.types';

class WechangoService {
  private baseUrl: string;
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.baseUrl = env.WECHANGO_BASE_URL;
    this.apiKey = env.WECHANGO_API_KEY;
    this.webhookSecret = env.WECHANGO_WEBHOOK_SECRET;
  }

  async createPayment(
    params: WechangoCreatePaymentParams,
    idempotencyKey: string,
  ): Promise<WechangoPayment> {
    const res = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new AppError(`Wechango payment creation failed: ${error}`, res.status);
    }

    return res.json() as Promise<WechangoPayment>;
  }

  async getPayment(paymentId: string): Promise<WechangoPayment> {
    const res = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new AppError(`Wechango get payment failed: ${error}`, res.status);
    }

    return res.json() as Promise<WechangoPayment>;
  }

  async cancelPayment(paymentId: string): Promise<WechangoPayment> {
    const res = await fetch(`${this.baseUrl}/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new AppError(`Wechango cancel payment failed: ${error}`, res.status);
    }

    return res.json() as Promise<WechangoPayment>;
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    if (!this.webhookSecret || !signatureHeader) return false;

    const parts = signatureHeader.split(',');
    const tPart = parts.find((p) => p.startsWith('t='));
    const v1Part = parts.find((p) => p.startsWith('v1='));

    if (!tPart || !v1Part) return false;

    const timestamp = tPart.replace('t=', '');
    const signature = v1Part.replace('v1=', '');
    const payload = `${timestamp}.${rawBody}`;

    const expected = crypto.createHmac('sha256', this.webhookSecret).update(payload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  parseWebhookEvent(rawBody: string): WechangoWebhookEvent {
    return JSON.parse(rawBody) as WechangoWebhookEvent;
  }
}

export const wechangoService = new WechangoService();
