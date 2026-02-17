import prisma from '../../config/database';
import type { ApplyAuthorDto, UpdateAuthorDto } from './authors.dto';
import type { PaginationQuery } from '../../shared/utils/pagination';
import { getPaginationParams } from '../../shared/utils/pagination';

export class AuthorsRepository {
  async findByUserId(userId: string) {
    return prisma.authorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.authorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        books: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            price: true,
            publishedAt: true,
          },
        },
        _count: { select: { followers: true } },
      },
    });
  }

  async findAll(query: PaginationQuery) {
    const { skip, take } = getPaginationParams(query);

    const [authors, total] = await Promise.all([
      prisma.authorProfile.findMany({
        where: { status: 'APPROVED' },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          _count: { select: { books: true, followers: true } },
        },
      }),
      prisma.authorProfile.count({ where: { status: 'APPROVED' } }),
    ]);

    return { authors, total };
  }

  async create(userId: string, data: ApplyAuthorDto) {
    return prisma.authorProfile.create({
      data: { userId, ...data },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(userId: string, data: UpdateAuthorDto) {
    return prisma.authorProfile.update({
      where: { userId },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getStats(authorId: string) {
    const [totalBooks, totalSales, totalRevenue, avgRating] = await Promise.all([
      prisma.book.count({ where: { authorId } }),
      prisma.purchase.count({
        where: { book: { authorId }, status: 'COMPLETED' },
      }),
      prisma.authorTransaction.aggregate({
        where: { authorId, type: 'SALE', status: 'COMPLETED' },
        _sum: { netAmount: true },
      }),
      prisma.review.aggregate({
        where: { book: { authorId }, status: 'VISIBLE' },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      totalBooks,
      totalSales,
      totalRevenue: totalRevenue._sum.netAmount ?? 0,
      averageRating: avgRating._avg.rating ?? 0,
      totalRatings: avgRating._count.rating,
    };
  }

  async getEarnings(authorId: string, query: PaginationQuery) {
    const { skip, take } = getPaginationParams(query);

    const [profile, transactions, total] = await Promise.all([
      prisma.authorProfile.findUnique({
        where: { id: authorId },
        select: { balance: true },
      }),
      prisma.authorTransaction.findMany({
        where: { authorId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          book: { select: { id: true, title: true } },
        },
      }),
      prisma.authorTransaction.count({ where: { authorId } }),
    ]);

    return { balance: profile?.balance ?? 0, transactions, total };
  }

  // ---- Follow methods ----

  async follow(userId: string, authorId: string) {
    return prisma.authorFollower.create({
      data: { userId, authorId },
    });
  }

  async unfollow(userId: string, authorId: string) {
    return prisma.authorFollower.deleteMany({
      where: { userId, authorId },
    });
  }

  async isFollowing(userId: string, authorId: string) {
    const record = await prisma.authorFollower.findUnique({
      where: { userId_authorId: { userId, authorId } },
    });
    return !!record;
  }

  async getFollowerCount(authorId: string) {
    return prisma.authorFollower.count({ where: { authorId } });
  }

  async getFollowerUserIds(authorId: string) {
    const followers = await prisma.authorFollower.findMany({
      where: { authorId },
      select: { userId: true },
    });
    return followers.map((f) => f.userId);
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
  }
}
