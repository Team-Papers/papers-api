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
            bio: true,
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

  private get publishedBookInclude() {
    return {
      author: {
        select: {
          id: true,
          penName: true,
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
      },
      _count: { select: { reviews: true } },
    };
  }

  async findTrending(limit = 10) {
    return prisma.book.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy: [{ purchases: { _count: 'desc' } }, { reviews: { _count: 'desc' } }],
      include: this.publishedBookInclude,
    });
  }

  async findNew(limit = 10) {
    return prisma.book.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: this.publishedBookInclude,
    });
  }

  async findRecommended(limit = 10) {
    return prisma.book.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy: { reviews: { _count: 'desc' } },
      include: this.publishedBookInclude,
    });
  }

  async findPersonalizedRecommended(userId: string, limit = 10) {
    // Fetch user preferences for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        country: true,
        ageGroup: true,
        booksLastYear: true,
        readingBarriers: true,
      },
    });

    // Tier 1: Categories from user's purchases, favorites, and reviews
    const behavioralCategories = await prisma.bookCategory.findMany({
      where: {
        book: {
          OR: [
            { purchases: { some: { userId, status: 'COMPLETED' } } },
            { favorites: { some: { userId } } },
            { reviews: { some: { userId } } },
          ],
        },
      },
      select: { categoryId: true },
      distinct: ['categoryId'],
    });

    let categoryIds = behavioralCategories.map((bc) => bc.categoryId);

    // Tier 2: If no behavioral data, use onboarding interests
    if (categoryIds.length === 0) {
      const interests = await prisma.userInterest.findMany({
        where: { userId },
        select: { categoryId: true },
      });
      categoryIds = interests.map((i) => i.categoryId);
    }

    // Tier 3: If still nothing, fall back to global top-rated
    if (categoryIds.length === 0) {
      return this.findRecommended(limit);
    }

    // Exclude already purchased books
    const purchasedBooks = await prisma.purchase.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { bookId: true },
    });
    const excludeIds = purchasedBooks.map((p) => p.bookId);

    const where: any = {
      status: 'PUBLISHED',
      categories: { some: { categoryId: { in: categoryIds } } },
    };
    if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds };
    }

    // Apply preference-based filters
    if (user?.booksLastYear === '0-2') {
      where.pageCount = { lt: 150 };
    }

    if (user?.readingBarriers?.includes('Prix')) {
      where.price = { equals: 0 };
    }

    // Fetch more results to allow re-ranking by user preferences
    const fetchLimit = user?.country ? limit * 2 : limit;

    const books = await prisma.book.findMany({
      where,
      take: fetchLimit,
      orderBy: [{ reviews: { _count: 'desc' } }, { purchases: { _count: 'desc' } }],
      include: this.publishedBookInclude,
    });

    // Boost books matching user's country language
    if (user?.country && books.length > limit) {
      const countryLanguageMap: Record<string, string> = {
        Cameroun: 'fr',
        France: 'fr',
        Senegal: 'fr',
        "Côte d'Ivoire": 'fr',
        Congo: 'fr',
        Gabon: 'fr',
        Nigeria: 'en',
        Ghana: 'en',
        'South Africa': 'en',
        Kenya: 'en',
        USA: 'en',
        UK: 'en',
        Canada: 'en',
      };

      const preferredLanguage = countryLanguageMap[user.country];
      if (preferredLanguage) {
        const boosted = books.sort((a: any, b: any) => {
          const aMatch = a.language === preferredLanguage ? 1 : 0;
          const bMatch = b.language === preferredLanguage ? 1 : 0;
          return bMatch - aMatch;
        });
        return boosted.slice(0, limit);
      }
    }

    return books.slice(0, limit);
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
