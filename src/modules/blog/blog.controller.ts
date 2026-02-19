import { Request, Response } from 'express';
import { BlogService } from './blog.service';
import { sendSuccess } from '../../shared/utils/response';
import { listArticlesDto } from './blog.dto';

const blogService = new BlogService();

export class BlogController {
  // ---- Admin ----

  async create(req: Request, res: Response) {
    const article = await blogService.create(req.body);
    sendSuccess(res, article, 201);
  }

  async update(req: Request, res: Response) {
    const article = await blogService.update(req.params.id as string, req.body);
    sendSuccess(res, article);
  }

  async delete(req: Request, res: Response) {
    await blogService.delete(req.params.id as string);
    sendSuccess(res, { message: 'Article deleted' });
  }

  async getAll(req: Request, res: Response) {
    const query = listArticlesDto.parse(req.query);
    const { items, total } = await blogService.getAll(query);
    res.json({
      success: true,
      data: items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  }

  async getById(req: Request, res: Response) {
    const article = await blogService.getById(req.params.id as string);
    sendSuccess(res, article);
  }

  // ---- Public ----

  async getPublished(req: Request, res: Response) {
    const query = listArticlesDto.parse(req.query);
    const { items, total } = await blogService.getPublished(query);
    res.json({
      success: true,
      data: items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  }

  async getBySlug(req: Request, res: Response) {
    const article = await blogService.getBySlug(req.params.slug as string);

    // If user is authenticated, check if they liked it
    let hasLiked = false;
    if (req.user) {
      hasLiked = await blogService.hasUserLiked(article.id, req.user.userId);
    }

    sendSuccess(res, { ...article, hasLiked });
  }

  async toggleLike(req: Request, res: Response) {
    const result = await blogService.toggleLike(req.params.id as string, req.user!.userId);
    sendSuccess(res, result);
  }
}
