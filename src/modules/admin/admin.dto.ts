import { z } from 'zod/v4';

export const adminUsersQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  role: z.enum(['READER', 'AUTHOR', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']).optional(),
});

export const adminAuthorsQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  q: z.string().optional(),
});

export const adminBooksQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED']).optional(),
  q: z.string().optional(),
});

export const adminTransactionsQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['SALE', 'WITHDRAWAL']).optional(),
});

export const rejectBookDto = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(1000),
});

export const createCategoryDto = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  parentId: z.string().min(1).optional(),
  icon: z.string().max(50).optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export const updateCategoryDto = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  parentId: z.string().min(1).nullable().optional(),
  icon: z.string().max(50).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export type AdminUsersQueryDto = z.infer<typeof adminUsersQueryDto>;
export type AdminAuthorsQueryDto = z.infer<typeof adminAuthorsQueryDto>;
export type AdminBooksQueryDto = z.infer<typeof adminBooksQueryDto>;
export type AdminTransactionsQueryDto = z.infer<typeof adminTransactionsQueryDto>;
export type RejectBookDto = z.infer<typeof rejectBookDto>;
export const createAdminDto = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDto>;
export type CreateAdminDto = z.infer<typeof createAdminDto>;
