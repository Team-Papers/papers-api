import { z } from 'zod/v4';

export const updateProgressDto = z.object({
  progress: z.number().min(0).max(100),
  currentPage: z.number().int().min(0),
});

export type UpdateProgressDto = z.infer<typeof updateProgressDto>;
