import { Request, Response } from 'express';
import { BooksService } from './books.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { paginationSchema } from '../../shared/utils/pagination';
import { searchBooksDto } from './books.dto';

const booksService = new BooksService();

export class BooksController {
  async create(req: Request, res: Response) {
    const book = await booksService.create(req.user!.userId, req.body);
    sendSuccess(res, book, 201);
  }

  async update(req: Request, res: Response) {
    const book = await booksService.update(req.user!.userId, req.params.id as string, req.body);
    sendSuccess(res, book);
  }

  async delete(req: Request, res: Response) {
    await booksService.delete(req.user!.userId, req.params.id as string);
    sendSuccess(res, { message: 'Book deleted successfully' });
  }

  async getMyBooks(req: Request, res: Response) {
    const query = paginationSchema.parse(req.query);
    const { books, total } = await booksService.getMyBooks(req.user!.userId, query);
    sendPaginated(res, books, { page: query.page, limit: query.limit, total });
  }

  async submit(req: Request, res: Response) {
    const book = await booksService.submit(req.user!.userId, req.params.id as string);
    sendSuccess(res, book);
  }

  async getCatalogue(req: Request, res: Response) {
    const query = searchBooksDto.parse(req.query);
    const { books, total } = await booksService.getCatalogue(query);
    sendPaginated(res, books, { page: query.page, limit: query.limit, total });
  }

  async search(req: Request, res: Response) {
    const query = searchBooksDto.parse(req.query);
    const { books, total } = await booksService.getCatalogue(query);
    sendPaginated(res, books, { page: query.page, limit: query.limit, total });
  }

  async getById(req: Request, res: Response) {
    const book = await booksService.getById(req.params.id as string);
    sendSuccess(res, book);
  }

  async getPreview(req: Request, res: Response) {
    const preview = await booksService.getPreview(req.params.id as string);
    sendSuccess(res, preview);
  }
}
