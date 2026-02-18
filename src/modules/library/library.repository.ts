import prisma from '../../config/database';
import type { PaginationQuery } from '../../shared/utils/pagination';
import { getPaginationParams } from '../../shared/utils/pagination';

export class LibraryRepository {
  async findByUserId(userId: string, query: PaginationQuery) {
    const { skip, take } = getPaginationParams(query);

    const [books, total, favoriteBookIds] = await Promise.all([
      prisma.userLibrary.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { lastReadAt: { sort: 'desc', nulls: 'last' } },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              pageCount: true,
              author: {
                select: {
                  id: true,
                  penName: true,
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      }),
      prisma.userLibrary.count({ where: { userId } }),
      prisma.favorite.findMany({
        where: { userId },
        select: { bookId: true },
      }),
    ]);

    const favoriteSet = new Set(favoriteBookIds.map((f) => f.bookId));
    const booksWithFavorite = books.map((b) => ({
      ...b,
      isFavorite: favoriteSet.has(b.bookId),
    }));

    return { books: booksWithFavorite, total };
  }

  async findByUserAndBook(userId: string, bookId: string) {
    return prisma.userLibrary.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            fileUrl: true,
            fileFormat: true,
            pageCount: true,
            author: {
              select: {
                id: true,
                penName: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
  }

  async updateProgress(userId: string, bookId: string, progress: number, currentPage: number) {
    return prisma.userLibrary.update({
      where: { userId_bookId: { userId, bookId } },
      data: { progress, currentPage, lastReadAt: new Date() },
    });
  }
}
