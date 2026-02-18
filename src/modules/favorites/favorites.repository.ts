import prisma from '../../config/database';

export class FavoritesRepository {
  async findByUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            pageCount: true,
            price: true,
            author: {
              select: {
                id: true,
                penName: true,
                photoUrl: true,
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });
  }

  async findByUserAndBook(userId: string, bookId: string) {
    return prisma.favorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  }

  async create(userId: string, bookId: string) {
    return prisma.favorite.create({
      data: { userId, bookId },
    });
  }

  async delete(userId: string, bookId: string) {
    return prisma.favorite.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  }

  async getFavoriteBookIds(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { bookId: true },
    });
    return new Set(favorites.map((f) => f.bookId));
  }
}
