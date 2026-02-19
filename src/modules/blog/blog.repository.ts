import prisma from '../../config/database';
import type { CreateArticleDto, UpdateArticleDto, ListArticlesDto } from './blog.dto';

export class BlogRepository {
  async create(data: CreateArticleDto, slug: string) {
    return prisma.article.create({
      data: {
        ...data,
        slug,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }

  async update(id: string, data: UpdateArticleDto) {
    const updateData: any = { ...data };

    // Set publishedAt when first published
    if (data.status === 'PUBLISHED') {
      const article = await prisma.article.findUnique({ where: { id } });
      if (article && !article.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    return prisma.article.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.article.delete({ where: { id } });
  }

  async findById(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: { _count: { select: { likes: true } } },
    });
  }

  async findBySlug(slug: string) {
    return prisma.article.findUnique({
      where: { slug },
      include: { _count: { select: { likes: true } } },
    });
  }

  async findMany(query: ListArticlesDto) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { content: { contains: query.q, mode: 'insensitive' } },
        { category: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { likes: true } } },
      }),
      prisma.article.count({ where }),
    ]);

    return { items, total };
  }

  async findPublished(query: ListArticlesDto) {
    const where: any = { status: 'PUBLISHED' };
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { category: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { publishedAt: 'desc' },
        include: { _count: { select: { likes: true } } },
      }),
      prisma.article.count({ where }),
    ]);

    return { items, total };
  }

  async toggleLike(articleId: string, userId: string): Promise<boolean> {
    const existing = await prisma.articleLike.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.articleLike.delete({ where: { id: existing.id } }),
        prisma.article.update({ where: { id: articleId }, data: { likesCount: { decrement: 1 } } }),
      ]);
      return false; // unliked
    } else {
      await prisma.$transaction([
        prisma.articleLike.create({ data: { articleId, userId } }),
        prisma.article.update({ where: { id: articleId }, data: { likesCount: { increment: 1 } } }),
      ]);
      return true; // liked
    }
  }

  async hasUserLiked(articleId: string, userId: string): Promise<boolean> {
    const like = await prisma.articleLike.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });
    return !!like;
  }
}
