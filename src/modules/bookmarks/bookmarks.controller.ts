import { Request, Response } from 'express';
import { BookmarksService } from './bookmarks.service';
import { sendSuccess } from '../../shared/utils/response';

const bookmarksService = new BookmarksService();

export class BookmarksController {
  async getBookmarks(req: Request, res: Response) {
    const bookmarks = await bookmarksService.getBookmarks(
      req.user!.userId,
      req.params.bookId as string,
    );
    sendSuccess(res, bookmarks);
  }

  async createBookmark(req: Request, res: Response) {
    const bookmark = await bookmarksService.createBookmark(
      req.user!.userId,
      req.params.bookId as string,
      req.body,
    );
    sendSuccess(res, bookmark, 201);
  }

  async deleteBookmark(req: Request, res: Response) {
    await bookmarksService.deleteBookmark(req.user!.userId, req.params.id as string);
    sendSuccess(res, { message: 'Bookmark deleted successfully' });
  }
}
