import prisma from '../../config/database';
import type { CreateBookDto, UpdateBookDto, SearchBooksDto, MyBooksQueryDto } from './books.dto';

export class BooksRepository {
  async create(authorId: string, data: CreateBookDto, slug: string) {
    const { categoryIds, ...bookData } = data;

    return prisma.book.create({
      data: {
        ...bookData,
        authorId,
        slug,
        price: bookData.price,
        categories:
          categoryIds.length > 0
            ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
            : undefined,
      },
      include: {
        categories: { include: { category: true } },
        author: {
          select: {
            id: true,
            penName: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateBookDto) {
    const { categoryIds, ...bookData } = data;

    if (categoryIds) {
      await prisma.bookCategory.deleteMany({ where: { bookId: id } });
      await prisma.bookCategory.createMany({
        data: categoryIds.map((categoryId) => ({ bookId: id, categoryId })),
      });
    }

    return prisma.book.update({
      where: { id },
      data: bookData,
      include: {
        categories: { include: { category: true } },
        author: {
          select: {
            id: true,
            penName: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.book.delete({ where: { id } });
  }

  async findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        author: {
          select: {
            id: true,
            penName: true,
            photoUrl: true,
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: { select: { reviews: true, purchases: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.book.findUnique({
      where: { slug },
      include: {
        categories: { include: { category: true } },
        author: {
          select: {
            id: true,
            penName: true,
            photoUrl: true,
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: { select: { reviews: true, purchases: true } },
      },
    });
  }

  async findByAuthorId(authorId: string, query: MyBooksQueryDto) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { authorId };
    if (status) {
      where.status = status;
    }

    const [rawBooks, total] = (await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: { include: { category: true } },
          reviews: { select: { rating: true } },
          purchases: { where: { status: 'COMPLETED' }, select: { id: true } },
          transactions: {
            where: { type: 'SALE', status: 'COMPLETED' },
            select: { netAmount: true },
          },
        },
      }),
      prisma.book.count({ where }),
    ])) as [any[], number];

    // Compute aggregated fields for each book
    const books = rawBooks.map((book: any) => {
      const reviewCount = book.reviews.length;
      const totalSales = book.purchases.length;
      const averageRating =
        reviewCount > 0
          ? book.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
          : 0;
      const totalRevenue = book.transactions.reduce(
        (sum: number, t: any) => sum + Number(t.netAmount),
        0,
      );

      // Remove the raw relation arrays from response
      const {
        reviews: _reviews,
        purchases: _purchases,
        transactions: _transactions,
        ...bookData
      } = book;

      return {
        ...bookData,
        totalSales,
        totalRevenue,
        averageRating,
        reviewCount,
      };
    });

    return { books, total };
  }

  async findPublished(query: SearchBooksDto) {
    const { q, categoryId, minPrice, maxPrice, language, page, limit, sort, order } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { author: { penName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (categoryId) {
      where.categories = { some: { categoryId } };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (language) {
      where.language = language;
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          author: {
            select: {
              id: true,
              penName: true,
              user: { select: { firstName: true, lastName: true, avatarUrl: true } },
            },
          },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return { books, total };
  }

  async countCategories(bookId: string) {
    return prisma.bookCategory.count({ where: { bookId } });
  }

  async updateStatus(id: string, status: string, rejectionReason?: string) {
    const data: any = { status };
    if (status === 'PUBLISHED') {
      data.publishedAt = new Date();
    }
    if (rejectionReason) {
      data.rejectionReason = rejectionReason;
    }
    return prisma.book.update({ where: { id }, data });
  }
}
