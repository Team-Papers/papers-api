import { z } from 'zod/v4';

export const applyAuthorDto = z.object({
  penName: z.string().min(2, 'Pen name must be at least 2 characters').max(100),
  bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
  website: z.string().url().optional(),
  twitter: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  mtnNumber: z.string().max(20).optional(),
  omNumber: z.string().max(20).optional(),
});

export const updateAuthorDto = z.object({
  penName: z.string().min(2).max(100).optional(),
  bio: z.string().min(10).optional(),
  photoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  twitter: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  mtnNumber: z.string().max(20).optional(),
  omNumber: z.string().max(20).optional(),
});

export type ApplyAuthorDto = z.infer<typeof applyAuthorDto>;
export type UpdateAuthorDto = z.infer<typeof updateAuthorDto>;
