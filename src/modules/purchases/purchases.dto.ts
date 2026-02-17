import { z } from 'zod/v4';

export const createPurchaseDto = z.object({
  bookId: z.string().min(1),
  paymentMethod: z.enum(['MTN', 'OM']),
});

export type CreatePurchaseDto = z.infer<typeof createPurchaseDto>;
