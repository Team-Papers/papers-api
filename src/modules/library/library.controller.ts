import { Request, Response } from 'express';
import { LibraryService } from './library.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { paginationSchema } from '../../shared/utils/pagination';

const libraryService = new LibraryService();

export class LibraryController {
  async getMyLibrary(req: Request, res: Response) {
    const query = paginationSchema.parse(req.query);
    const { books, total } = await libraryService.getMyLibrary(req.user!.userId, query);
    sendPaginated(res, books, { page: query.page, limit: query.limit, total });
  }

  async getBookDetail(req: Request, res: Response) {
    const entry = await libraryService.getBookDetail(req.user!.userId, req.params.bookId as string);
    sendSuccess(res, entry);
  }

  async updateProgress(req: Request, res: Response) {
    const entry = await libraryService.updateProgress(
      req.user!.userId,
      req.params.bookId as string,
      req.body,
    );
    sendSuccess(res, entry);
  }

  async getDownloadUrl(req: Request, res: Response) {
    const bookId = (req.params.bookId || req.params.id) as string;
    const result = await libraryService.getDownloadUrl(req.user!.userId, bookId);
    sendSuccess(res, result);
  }
}
