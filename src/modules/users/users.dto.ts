import { z } from 'zod/v4';

export const updateUserDto = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserDto>;

export const syncInterestsDto = z.object({
  categoryIds: z.array(z.string().uuid()).min(1).max(5),
});

export type SyncInterestsDto = z.infer<typeof syncInterestsDto>;

export const updateFcmTokenDto = z.object({
  fcmToken: z.string().min(1).max(500),
});

export type UpdateFcmTokenDto = z.infer<typeof updateFcmTokenDto>;

export const updatePreferencesDto = z.object({
  ageGroup: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
  booksLastYear: z.string().max(50).optional(),
  readingBarriers: z.array(z.string()).optional(),
  papersHelp: z.string().max(100).optional(),
  readingGoal: z.number().int().min(0).optional(),
});

export type UpdatePreferencesDto = z.infer<typeof updatePreferencesDto>;
