import prisma from '../../config/database';
import type { PaginationQuery } from '../../shared/utils/pagination';
import { getPaginationParams } from '../../shared/utils/pagination';

export class CategoriesRepository {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        children: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { books: true } },
      },
      where: { parentId: null },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        children: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { books: true } },
      },
    });
  }

  async findBooksByCategory(categoryId: string, query: PaginationQuery) {
    const { skip, take } = getPaginationParams(query);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: {
          status: 'PUBLISHED',
          categories: { some: { categoryId } },
        },
        skip,
        take,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              penName: true,
              user: {
                select: { firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.book.count({
        where: {
          status: 'PUBLISHED',
          categories: { some: { categoryId } },
        },
      }),
    ]);

    return { books, total };
  }
}
