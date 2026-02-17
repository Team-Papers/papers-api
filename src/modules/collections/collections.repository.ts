import prisma from '../../config/database';

const bookInclude = {
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
};

export class CollectionsRepository {
  async findAll() {
    return prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: { select: { books: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        books: {
          orderBy: { orderIndex: 'asc' },
          include: {
            book: {
              include: bookInclude,
            },
          },
        },
        _count: { select: { books: true } },
      },
    });
  }

  // Admin CRUD
  async findAllAdmin() {
    return prisma.collection.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: { select: { books: true } },
      },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    orderIndex?: number;
  }) {
    return prisma.collection.create({
      data,
      include: { _count: { select: { books: true } } },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
      orderIndex?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.collection.update({
      where: { id },
      data,
      include: { _count: { select: { books: true } } },
    });
  }

  async delete(id: string) {
    return prisma.collection.delete({ where: { id } });
  }

  async addBook(collectionId: string, bookId: string, orderIndex: number = 0) {
    return prisma.collectionBook.create({
      data: { collectionId, bookId, orderIndex },
    });
  }

  async removeBook(collectionId: string, bookId: string) {
    return prisma.collectionBook.delete({
      where: {
        collectionId_bookId: { collectionId, bookId },
      },
    });
  }
}
