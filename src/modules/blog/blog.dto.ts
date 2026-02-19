import { z } from 'zod/v4';

export const createArticleDto = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  coverUrl: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export const updateArticleDto = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  coverUrl: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const listArticlesDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export type CreateArticleDto = z.infer<typeof createArticleDto>;
export type UpdateArticleDto = z.infer<typeof updateArticleDto>;
export type ListArticlesDto = z.infer<typeof listArticlesDto>;
