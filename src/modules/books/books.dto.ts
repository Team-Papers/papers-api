import { z } from 'zod/v4';

export const createBookDto = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  isbn: z.string().max(20).optional(),
  language: z.string().max(10).default('fr'),
  pageCount: z.number().int().positive().optional(),
  price: z.number().min(0).default(0),
  coverUrl: z.string().max(500).optional(), // Relative path for local storage
  fileUrl: z.string().max(500).optional(), // Filename for local storage
  fileSize: z.number().int().positive().optional(),
  fileFormat: z.string().max(10).optional(),
  previewPercent: z.number().int().min(5).max(20).default(10),
  categoryIds: z.array(z.string().min(1)).max(3).default([]),
});

export const updateBookDto = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isbn: z.string().max(20).optional(),
  language: z.string().max(10).optional(),
  pageCount: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  coverUrl: z.string().max(500).optional(), // Relative path for local storage
  fileUrl: z.string().max(500).optional(), // Filename for local storage
  fileSize: z.number().int().positive().optional(),
  fileFormat: z.string().max(10).optional(),
  previewPercent: z.number().int().min(5).max(20).optional(),
  categoryIds: z.array(z.string().min(1)).min(1).max(3).optional(),
});

export const searchBooksDto = z.object({
  q: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  language: z.string().max(10).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['publishedAt', 'price', 'title']).default('publishedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const myBooksQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED']).optional(),
});

export type CreateBookDto = z.infer<typeof createBookDto>;
export type UpdateBookDto = z.infer<typeof updateBookDto>;
export type SearchBooksDto = z.infer<typeof searchBooksDto>;
export type MyBooksQueryDto = z.infer<typeof myBooksQueryDto>;
