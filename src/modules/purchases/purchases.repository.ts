import prisma from '../../config/database';
import type { PaginationQuery } from '../../shared/utils/pagination';
import { getPaginationParams } from '../../shared/utils/pagination';

export class PurchasesRepository {
  async create(userId: string, bookId: string, amount: number, paymentMethod: string) {
    return prisma.purchase.create({
      data: { userId, bookId, amount, paymentMethod },
      include: {
        book: {
          select: { id: true, title: true, slug: true, coverUrl: true, price: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.purchase.findUnique({
      where: { id },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            price: true,
            authorId: true,
            author: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUserAndBook(userId: string, bookId: string) {
    return prisma.purchase.findFirst({
      where: { userId, bookId, status: 'COMPLETED' },
    });
  }

  async findByUserId(userId: string, query: PaginationQuery) {
    const { skip, take } = getPaginationParams(query);

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          book: {
            select: { id: true, title: true, slug: true, coverUrl: true, price: true },
          },
        },
      }),
      prisma.purchase.count({ where: { userId } }),
    ]);

    return { purchases, total };
  }

  async updateStatus(
    id: string,
    status: import('../../generated/prisma/enums').PurchaseStatus,
    paymentRef?: string,
  ) {
    return prisma.purchase.update({
      where: { id },
      data: { status, ...(paymentRef && { paymentRef }) },
    });
  }
}
