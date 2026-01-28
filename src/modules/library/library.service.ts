import { LibraryRepository } from './library.repository';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';
import type { UpdateProgressDto } from './library.dto';
import type { PaginationQuery } from '../../shared/utils/pagination';

export class LibraryService {
  private libraryRepository: LibraryRepository;

  constructor() {
    this.libraryRepository = new LibraryRepository();
  }

  async getMyLibrary(userId: string, query: PaginationQuery) {
    return this.libraryRepository.findByUserId(userId, query);
  }

  async getBookDetail(userId: string, bookId: string) {
    const entry = await this.libraryRepository.findByUserAndBook(userId, bookId);
    if (!entry) {
      throw new ForbiddenError('You do not own this book');
    }
    return entry;
  }

  async updateProgress(userId: string, bookId: string, data: UpdateProgressDto) {
    const entry = await this.libraryRepository.findByUserAndBook(userId, bookId);
    if (!entry) {
      throw new ForbiddenError('You do not own this book');
    }
    return this.libraryRepository.updateProgress(userId, bookId, data.progress, data.currentPage);
  }

  async getDownloadUrl(userId: string, bookId: string) {
    const entry = await this.libraryRepository.findByUserAndBook(userId, bookId);
    if (!entry) {
      throw new ForbiddenError('You do not own this book');
    }
    if (!entry.book.fileUrl) {
      throw new NotFoundError('Book file');
    }
    return { url: entry.book.fileUrl, format: entry.book.fileFormat };
  }
}
