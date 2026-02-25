import prisma from '../../config/database';
import type { UserStatus, AuthorStatus, Role, ReviewStatus } from '../../generated/prisma/enums';
import type {
  AdminUsersQueryDto,
  AdminAuthorsQueryDto,
  AdminBooksQueryDto,
  AdminTransactionsQueryDto,
  AdminReviewsQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './admin.dto';

export class AdminRepository {
  // Dashboard
  async getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      usersCount,
      authorsCount,
      booksCount,
      totalRevenue,
      pendingAuthors,
      pendingBooks,
      recentTransactions,
      salesLast30Days,
      topBooks,
      topAuthors,
      categoryDistribution,
      newUsersLast7Days,
      avgRating,
      totalPurchases,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.authorProfile.count({ where: { status: 'APPROVED' } }),
      prisma.book.count({ where: { status: 'PUBLISHED' } }),
      prisma.authorTransaction.aggregate({
        where: { type: 'SALE', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.authorProfile.count({ where: { status: 'PENDING' } }),
      prisma.book.count({ where: { status: 'PENDING' } }),

      // Recent transactions (last 10)
      prisma.authorTransaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { penName: true, user: { select: { firstName: true, lastName: true } } },
          },
          book: { select: { title: true } },
        },
      }),

      // Sales per day (last 30 days)
      prisma.$queryRaw<{ date: string; amount: number }[]>`
        SELECT DATE(created_at) as date, COALESCE(SUM(amount), 0)::int as amount
        FROM author_transactions
        WHERE type = 'SALE' AND status = 'COMPLETED' AND created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Top 5 books by sales count
      prisma.book.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { purchases: { _count: 'desc' } },
        select: {
          id: true,
          title: true,
          coverUrl: true,
          price: true,
          author: { select: { penName: true } },
          _count: { select: { purchases: true } },
        },
      }),

      // Top 5 authors by revenue (use raw query since no totalRevenue field)
      prisma.$queryRaw<
        {
          id: string;
          pen_name: string | null;
          photo_url: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          total_revenue: number;
          total_books: number;
        }[]
      >`
        SELECT ap.id, ap.pen_name, ap.photo_url,
               u.first_name, u.last_name, u.avatar_url,
               COALESCE(SUM(at.amount), 0)::int as total_revenue,
               COUNT(DISTINCT b.id)::int as total_books
        FROM author_profiles ap
        JOIN users u ON u.id = ap.user_id
        LEFT JOIN author_transactions at ON at.author_id = ap.id AND at.type = 'SALE' AND at.status = 'COMPLETED'
        LEFT JOIN books b ON b.author_id = ap.id AND b.status = 'PUBLISHED'
        WHERE ap.status = 'APPROVED'
        GROUP BY ap.id, ap.pen_name, ap.photo_url, u.first_name, u.last_name, u.avatar_url
        ORDER BY total_revenue DESC
        LIMIT 5
      `,

      // Books per category
      prisma.category.findMany({
        select: { name: true, _count: { select: { books: true } } },
        orderBy: { books: { _count: 'desc' } },
        take: 10,
      }),

      // New users per day (last 7 days)
      prisma.$queryRaw<{ date: string; count: number }[]>`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM users
        WHERE created_at >= ${sevenDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Average review rating
      prisma.review.aggregate({
        where: { status: 'VISIBLE' },
        _avg: { rating: true },
        _count: true,
      }),

      // Total purchases
      prisma.purchase.count(),
    ]);

    return {
      totalUsers: usersCount,
      totalAuthors: authorsCount,
      totalBooks: booksCount,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      pendingAuthors,
      pendingBooks,
      totalPurchases,
      avgRating: Math.round((avgRating._avg.rating ?? 0) * 10) / 10,
      totalReviews: avgRating._count,
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        createdAt: tx.createdAt,
        authorName:
          tx.author.penName ||
          `${tx.author.user.firstName || ''} ${tx.author.user.lastName || ''}`.trim(),
        bookTitle: tx.book?.title || null,
      })),
      salesChart: salesLast30Days.map((row) => ({
        date: new Date(row.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        amount: Number(row.amount),
      })),
      topBooks: topBooks.map((b) => ({
        id: b.id,
        title: b.title,
        coverUrl: b.coverUrl,
        price: b.price,
        authorName: b.author.penName || '',
        salesCount: b._count.purchases,
      })),
      topAuthors: topAuthors.map((a) => ({
        id: a.id,
        penName: a.pen_name || `${a.first_name || ''} ${a.last_name || ''}`.trim(),
        photoUrl: a.photo_url || a.avatar_url,
        totalRevenue: Number(a.total_revenue),
        totalBooks: Number(a.total_books),
      })),
      categoryDistribution: categoryDistribution
        .filter((c) => c._count.books > 0)
        .map((c) => ({ name: c.name, count: c._count.books })),
      newUsersChart: newUsersLast7Days.map((row) => ({
        date: new Date(row.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        count: Number(row.count),
      })),
    };
  }

  // Users
  async findUsers(query: AdminUsersQueryDto) {
    const { page, limit, q, role, status } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        authorProfile: { select: { id: true, penName: true, status: true } },
        _count: { select: { purchases: true, reviews: true } },
      },
    });
  }

  async updateUserStatus(id: string, status: UserStatus) {
    return prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });
  }

  async updateUserRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true, status: true },
    });
  }

  // Authors
  async findAuthors(query: AdminAuthorsQueryDto) {
    const { page, limit, status, q } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { penName: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [authors, total] = await Promise.all([
      prisma.authorProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
          },
          _count: { select: { books: true } },
        },
      }),
      prisma.authorProfile.count({ where }),
    ]);

    return { authors, total };
  }

  async updateAuthorStatus(id: string, status: AuthorStatus) {
    const author = await prisma.authorProfile.update({
      where: { id },
      data: { status },
      include: { user: { select: { id: true, role: true } } },
    });

    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: author.user.id },
        data: { role: 'AUTHOR' },
      });
    }

    return author;
  }

  // Books
  async findBooks(query: AdminBooksQueryDto) {
    const { page, limit, status, q } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { author: { penName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              penName: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
          categories: { include: { category: { select: { id: true, name: true } } } },
          _count: { select: { purchases: true, reviews: true } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return { books, total };
  }

  async findBookById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                createdAt: true,
              },
            },
          },
        },
        categories: { include: { category: true } },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: { select: { purchases: true, reviews: true } },
      },
    });
  }

  async updateBookStatus(id: string, status: string, rejectionReason?: string) {
    // Get current book to handle rejection history
    const currentBook = await prisma.book.findUnique({
      where: { id },
      select: { rejectionReason: true, rejectionHistory: true },
    });

    const data: Record<string, unknown> = { status };

    if (status === 'PUBLISHED') {
      data.publishedAt = new Date();
      // Clear rejection reason when approving, but keep history
      data.rejectionReason = null;
    }

    if (rejectionReason) {
      // Add to rejection history
      const history =
        (currentBook?.rejectionHistory as Array<{ reason: string; date: string }>) || [];
      history.push({
        reason: rejectionReason,
        date: new Date().toISOString(),
      });
      data.rejectionHistory = history;
      data.rejectionReason = rejectionReason;
    }

    return prisma.book.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  // Categories CRUD
  async findAllCategories() {
    return prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        children: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { books: true } },
      },
    });
  }

  async createCategory(data: CreateCategoryDto) {
    return prisma.category.create({ data });
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    return prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return prisma.category.delete({ where: { id } });
  }

  // Reviews
  async findReviews(query: AdminReviewsQueryDto) {
    const { page, limit, status, q, bookId, userId } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (bookId) where.bookId = bookId;
    if (userId) where.userId = userId;
    if (q) {
      where.OR = [
        { comment: { contains: q, mode: 'insensitive' } },
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
        { user: { lastName: { contains: q, mode: 'insensitive' } } },
        { book: { title: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
          },
          book: {
            select: { id: true, title: true, coverUrl: true },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total };
  }

  async findReviewById(id: string) {
    return prisma.review.findUnique({ where: { id } });
  }

  async updateReviewStatus(id: string, status: ReviewStatus) {
    return prisma.review.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        book: { select: { id: true, title: true } },
      },
    });
  }

  async deleteReview(id: string) {
    return prisma.review.delete({ where: { id } });
  }

  // Transactions
  async findTransactions(query: AdminTransactionsQueryDto) {
    const { page, limit, type } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.authorTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              penName: true,
              user: {
                select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
              },
            },
          },
          book: { select: { id: true, title: true, coverUrl: true, price: true } },
          purchase: {
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              paymentRef: true,
              status: true,
              createdAt: true,
              user: {
                select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      }),
      prisma.authorTransaction.count({ where }),
    ]);

    return { transactions, total };
  }

  async findTransactionById(id: string) {
    return prisma.authorTransaction.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            penName: true,
            photoUrl: true,
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
            },
          },
        },
        book: {
          select: { id: true, title: true, coverUrl: true, price: true, slug: true },
        },
        purchase: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            paymentRef: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }
}
