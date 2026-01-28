import { BookmarksRepository } from './bookmarks.repository';
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error';
import type { CreateBookmarkDto } from './bookmarks.dto';

export class BookmarksService {
  private bookmarksRepository: BookmarksRepository;

  constructor() {
    this.bookmarksRepository = new BookmarksRepository();
  }

  async getBookmarks(userId: string, bookId: string) {
    return this.bookmarksRepository.findByUserAndBook(userId, bookId);
  }

  async createBookmark(userId: string, bookId: string, data: CreateBookmarkDto) {
    return this.bookmarksRepository.create(userId, bookId, data.page, data.note);
  }

  async deleteBookmark(userId: string, bookmarkId: string) {
    const bookmark = await this.bookmarksRepository.findById(bookmarkId);
    if (!bookmark) {
      throw new NotFoundError('Bookmark');
    }
    if (bookmark.userId !== userId) {
      throw new ForbiddenError('You can only delete your own bookmarks');
    }
    return this.bookmarksRepository.delete(bookmarkId);
  }
}
