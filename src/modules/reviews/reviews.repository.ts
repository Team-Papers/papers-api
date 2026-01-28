import prisma from '../../config/database';
import type { PaginationQuery } from '../../shared/utils/pagination';
import { getPaginationParams } from '../../shared/utils/pagination';

export class ReviewsRepository {
  async findByBookId(bookId: string, query: PaginationQuery) {
    const { skip, take } = getPaginationParams(query);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { bookId, status: 'VISIBLE' },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      }),
      prisma.review.count({ where: { bookId, status: 'VISIBLE' } }),
    ]);

    return { reviews, total };
  }

  async findByUserAndBook(userId: string, bookId: string) {
    return prisma.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  }

  async findById(id: string) {
    return prisma.review.findUnique({ where: { id } });
  }

  async create(userId: string, bookId: string, rating: number, comment?: string) {
    return prisma.review.create({
      data: { userId, bookId, rating, comment },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  async update(id: string, rating?: number, comment?: string) {
    return prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment }),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.review.delete({ where: { id } });
  }

  async getAverageRating(bookId: string) {
    const result = await prisma.review.aggregate({
      where: { bookId, status: 'VISIBLE' },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { average: result._avg.rating ?? 0, count: result._count.rating };
  }
}
