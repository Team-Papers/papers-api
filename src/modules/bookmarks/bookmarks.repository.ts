import prisma from '../../config/database';

export class BookmarksRepository {
  async findByUserAndBook(userId: string, bookId: string) {
    return prisma.bookmark.findMany({
      where: { userId, bookId },
      orderBy: { page: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.bookmark.findUnique({ where: { id } });
  }

  async create(userId: string, bookId: string, page: number, note?: string) {
    return prisma.bookmark.create({
      data: { userId, bookId, page, note },
    });
  }

  async delete(id: string) {
    return prisma.bookmark.delete({ where: { id } });
  }
}
