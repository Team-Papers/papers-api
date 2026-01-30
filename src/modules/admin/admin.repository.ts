import prisma from '../../config/database';
import type { UserStatus, AuthorStatus, Role } from '../../generated/prisma/enums';
import type {
  AdminUsersQueryDto,
  AdminAuthorsQueryDto,
  AdminBooksQueryDto,
  AdminTransactionsQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './admin.dto';

export class AdminRepository {
  // Dashboard
  async getDashboardStats() {
    const [usersCount, authorsCount, booksCount, totalRevenue, pendingAuthors, pendingBooks] =
      await Promise.all([
        prisma.user.count(),
        prisma.authorProfile.count({ where: { status: 'APPROVED' } }),
        prisma.book.count({ where: { status: 'PUBLISHED' } }),
        prisma.authorTransaction.aggregate({
          where: { type: 'SALE', status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.authorProfile.count({ where: { status: 'PENDING' } }),
        prisma.book.count({ where: { status: 'PENDING' } }),
      ]);

    return {
      usersCount,
      authorsCount,
      booksCount,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      pendingAuthors,
      pendingBooks,
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

  async updateBookStatus(id: string, status: string, rejectionReason?: string) {
    const data: Record<string, unknown> = { status };
    if (status === 'PUBLISHED') data.publishedAt = new Date();
    if (rejectionReason) data.rejectionReason = rejectionReason;

    return prisma.book.update({ where: { id }, data });
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
              user: { select: { firstName: true, lastName: true } },
            },
          },
          book: { select: { id: true, title: true } },
        },
      }),
      prisma.authorTransaction.count({ where }),
    ]);

    return { transactions, total };
  }
}
