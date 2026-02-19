import { BlogRepository } from './blog.repository';
import { NotFoundError } from '../../shared/errors/app-error';
import { generateSlug } from '../../shared/utils/slug';
import type { CreateArticleDto, UpdateArticleDto, ListArticlesDto } from './blog.dto';

export class BlogService {
  private repo: BlogRepository;

  constructor() {
    this.repo = new BlogRepository();
  }

  // ---- Admin routes ----

  async create(data: CreateArticleDto) {
    const slug = generateSlug(data.title);
    return this.repo.create(data, slug);
  }

  async update(id: string, data: UpdateArticleDto) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundError('Article');

    const updateData: UpdateArticleDto & { slug?: string } = { ...data };
    if (data.title && data.title !== article.title) {
      updateData.slug = generateSlug(data.title);
    }

    return this.repo.update(id, updateData);
  }

  async delete(id: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundError('Article');
    return this.repo.delete(id);
  }

  async getAll(query: ListArticlesDto) {
    return this.repo.findMany(query);
  }

  async getById(id: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundError('Article');
    return article;
  }

  // ---- Public routes ----

  async getPublished(query: ListArticlesDto) {
    return this.repo.findPublished(query);
  }

  async getBySlug(slug: string) {
    const article = await this.repo.findBySlug(slug);
    if (!article || article.status !== 'PUBLISHED') throw new NotFoundError('Article');
    return article;
  }

  async toggleLike(articleId: string, userId: string) {
    const article = await this.repo.findById(articleId);
    if (!article || article.status !== 'PUBLISHED') throw new NotFoundError('Article');
    const liked = await this.repo.toggleLike(articleId, userId);
    return { liked, likesCount: article.likesCount + (liked ? 1 : -1) };
  }

  async hasUserLiked(articleId: string, userId: string) {
    return this.repo.hasUserLiked(articleId, userId);
  }
}
