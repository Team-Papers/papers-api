import { BooksRepository } from './books.repository';
import { AuthorsRepository } from '../authors/authors.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/errors/app-error';
import { generateSlug } from '../../shared/utils/slug';
import { AuthorStatus, BookStatus } from '../../generated/prisma/enums';
import type { CreateBookDto, UpdateBookDto, SearchBooksDto, MyBooksQueryDto } from './books.dto';

export class BooksService {
  private booksRepository: BooksRepository;
  private authorsRepository: AuthorsRepository;

  constructor() {
    this.booksRepository = new BooksRepository();
    this.authorsRepository = new AuthorsRepository();
  }

  async create(userId: string, data: CreateBookDto) {
    const author = await this.authorsRepository.findByUserId(userId);
    if (!author || author.status !== AuthorStatus.APPROVED) {
      throw new ForbiddenError('Only approved authors can create books');
    }

    const slug = generateSlug(data.title);
    return this.booksRepository.create(author.id, data, slug);
  }

  async update(userId: string, bookId: string, data: UpdateBookDto) {
    const author = await this.authorsRepository.findByUserId(userId);
    if (!author) {
      throw new ForbiddenError('Author profile not found');
    }

    const book = await this.booksRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book');
    }

    if (book.authorId !== author.id) {
      throw new ForbiddenError('You can only edit your own books');
    }

    if (book.status === BookStatus.PUBLISHED || book.status === BookStatus.PENDING) {
      throw new BadRequestError('Cannot edit a published or pending book');
    }

    return this.booksRepository.update(bookId, data);
  }

  async delete(userId: string, bookId: string) {
    const author = await this.authorsRepository.findByUserId(userId);
    if (!author) {
      throw new ForbiddenError('Author profile not found');
    }

    const book = await this.booksRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book');
    }

    if (book.authorId !== author.id) {
      throw new ForbiddenError('You can only delete your own books');
    }

    if (book.status === BookStatus.PUBLISHED) {
      throw new BadRequestError('Cannot delete a published book');
    }

    return this.booksRepository.delete(bookId);
  }

  async getMyBooks(userId: string, query: MyBooksQueryDto) {
    const author = await this.authorsRepository.findByUserId(userId);
    if (!author) {
      throw new ForbiddenError('Author profile not found');
    }

    return this.booksRepository.findByAuthorId(author.id, query);
  }

  async submit(userId: string, bookId: string) {
    const author = await this.authorsRepository.findByUserId(userId);
    if (!author) {
      throw new ForbiddenError('Author profile not found');
    }

    const book = await this.booksRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book');
    }

    if (book.authorId !== author.id) {
      throw new ForbiddenError('You can only submit your own books');
    }

    if (book.status !== BookStatus.DRAFT && book.status !== BookStatus.REJECTED) {
      throw new BadRequestError('Only draft or rejected books can be submitted');
    }

    if (!book.fileUrl) {
      throw new BadRequestError('Book file is required before submission');
    }

    return this.booksRepository.updateStatus(bookId, BookStatus.PENDING);
  }

  async getCatalogue(query: SearchBooksDto) {
    return this.booksRepository.findPublished(query);
  }

  async getById(id: string) {
    const book = await this.booksRepository.findById(id);
    if (!book || book.status !== BookStatus.PUBLISHED) {
      throw new NotFoundError('Book');
    }
    return book;
  }

  async getPreview(id: string) {
    const book = await this.booksRepository.findById(id);
    if (!book || book.status !== BookStatus.PUBLISHED) {
      throw new NotFoundError('Book');
    }

    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      description: book.description,
      coverUrl: book.coverUrl,
      previewPercent: book.previewPercent,
      fileUrl: book.fileUrl,
      pageCount: book.pageCount,
      author: book.author,
    };
  }
}
