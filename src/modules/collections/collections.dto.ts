import { z } from 'zod/v4';

export const createCollectionDto = z.object({
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(150),
  description: z.string().optional(),
  imageUrl: z.string().max(500).optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export const updateCollectionDto = z.object({
  name: z.string().min(1).max(150).optional(),
  slug: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  imageUrl: z.string().max(500).optional(),
  orderIndex: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const addBookToCollectionDto = z.object({
  bookId: z.string().min(1),
  orderIndex: z.number().int().min(0).default(0),
});

export type CreateCollectionDto = z.infer<typeof createCollectionDto>;
export type UpdateCollectionDto = z.infer<typeof updateCollectionDto>;
export type AddBookToCollectionDto = z.infer<typeof addBookToCollectionDto>;
