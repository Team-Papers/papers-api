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
