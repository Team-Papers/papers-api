import { z } from 'zod/v4';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export const getPaginationParams = (query: PaginationQuery) => {
  const { page, limit } = query;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};
