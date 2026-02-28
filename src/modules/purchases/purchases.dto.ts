import { z } from 'zod/v4';

export const createPurchaseDto = z.object({
  bookId: z.string().min(1),
  paymentMethod: z.enum(['MTN', 'OM']),
  phoneNumber: z.string().min(9).max(15),
});

export type CreatePurchaseDto = z.infer<typeof createPurchaseDto>;
