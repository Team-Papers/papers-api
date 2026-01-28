import { z } from 'zod/v4';

export const createReviewDto = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const updateReviewDto = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
});

export type CreateReviewDto = z.infer<typeof createReviewDto>;
export type UpdateReviewDto = z.infer<typeof updateReviewDto>;
