import { z } from 'zod/v4';

export const createBookmarkDto = z.object({
  page: z.number().int().min(1),
  note: z.string().max(500).optional(),
});

export type CreateBookmarkDto = z.infer<typeof createBookmarkDto>;
