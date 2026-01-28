import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { paginationSchema } from '../../shared/utils/pagination';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async getAll(_req: Request, res: Response) {
    const categories = await categoriesService.getAll();
    sendSuccess(res, categories);
  }

  async getById(req: Request, res: Response) {
    const category = await categoriesService.getById(req.params.id as string);
    sendSuccess(res, category);
  }

  async getBooksByCategory(req: Request, res: Response) {
    const query = paginationSchema.parse(req.query);
    const { books, total } = await categoriesService.getBooksByCategory(
      req.params.id as string,
      query,
    );
    sendPaginated(res, books, { page: query.page, limit: query.limit, total });
  }
}
