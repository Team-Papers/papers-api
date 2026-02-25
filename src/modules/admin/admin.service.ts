import bcrypt from 'bcryptjs';
import { AdminRepository } from './admin.repository';
import { AuthRepository } from '../auth/auth.repository';
import { AuthorsRepository } from '../authors/authors.repository';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error';
import { storageService } from '../../shared/services/storage.service';
import { notificationsService } from '../notifications/notifications.service';
import type {
  AdminUsersQueryDto,
  AdminAuthorsQueryDto,
  AdminBooksQueryDto,
  AdminTransactionsQueryDto,
  AdminReviewsQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateAdminDto,
} from './admin.dto';

export class AdminService {
  private adminRepository: AdminRepository;
  private authRepository: AuthRepository;
  private authorsRepository: AuthorsRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.authRepository = new AuthRepository();
    this.authorsRepository = new AuthorsRepository();
  }

  async getDashboard() {
    return this.adminRepository.getDashboardStats();
  }

  async getUsersChart(period: string) {
    return this.adminRepository.getUsersChart(period);
  }

  async createAdmin(data: CreateAdminDto) {
    const existing = await this.authRepository.findUserByEmail(data.email);
    if (existing) throw new BadRequestError('Email already in use');
    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.authRepository.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'ADMIN',
      emailVerified: true,
    });
  }

  // Users
  async getUsers(query: AdminUsersQueryDto) {
    return this.adminRepository.findUsers(query);
  }

  async getUserById(id: string) {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async suspendUser(id: string) {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    if (user.role === 'ADMIN') throw new BadRequestError('Cannot suspend an admin');
    return this.adminRepository.updateUserStatus(id, 'SUSPENDED');
  }

  async banUser(id: string) {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    if (user.role === 'ADMIN') throw new BadRequestError('Cannot ban an admin');
    return this.adminRepository.updateUserStatus(id, 'BANNED');
  }

  async activateUser(id: string) {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    return this.adminRepository.updateUserStatus(id, 'ACTIVE');
  }

  async promoteUser(id: string) {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    if (user.role === 'ADMIN') throw new BadRequestError('User is already an admin');
    if (user.status !== 'ACTIVE') throw new BadRequestError('Only active users can be promoted');
    return this.adminRepository.updateUserRole(id, 'ADMIN');
  }

  async demoteUser(id: string, currentAdminId: string) {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    if (user.role !== 'ADMIN') throw new BadRequestError('User is not an admin');
    if (user.id === currentAdminId) throw new BadRequestError('Cannot demote yourself');
    return this.adminRepository.updateUserRole(id, 'READER');
  }

  async deleteUser(id: string, currentAdminId: string) {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    if (user.role === 'ADMIN') throw new BadRequestError('Cannot delete an admin account');
    if (user.id === currentAdminId) throw new BadRequestError('Cannot delete your own account');
    return this.adminRepository.deleteUser(id);
  }

  // Authors
  async getAuthors(query: AdminAuthorsQueryDto) {
    return this.adminRepository.findAuthors(query);
  }

  async getAuthorById(id: string) {
    const author = await this.adminRepository.findAuthorById(id);
    if (!author) throw new NotFoundError('Author');
    return author;
  }

  async approveAuthor(id: string) {
    const author = await this.adminRepository.updateAuthorStatus(id, 'APPROVED');
    // Send notification to the author
    await notificationsService.notifyAuthorApproved(author.user.id);
    return author;
  }

  async rejectAuthor(id: string, reason?: string) {
    const author = await this.adminRepository.updateAuthorStatus(id, 'REJECTED');
    // Send notification to the author
    await notificationsService.notifyAuthorRejected(author.user.id, reason);
    return author;
  }

  // Books
  async getBooks(query: AdminBooksQueryDto) {
    return this.adminRepository.findBooks(query);
  }

  async getBookById(id: string) {
    const book = await this.adminRepository.findBookById(id);
    if (!book) throw new NotFoundError('Book');
    return book;
  }

  async approveBook(id: string) {
    // Get book details first for notification
    const book = await this.adminRepository.findBookById(id);
    if (!book) throw new NotFoundError('Book');

    const result = await this.adminRepository.updateBookStatus(id, 'PUBLISHED');

    // Send notification to the author
    await notificationsService.notifyBookApproved(book.author.user.id, book.title, book.id);

    // Notify all followers of this author about the new book
    const followerUserIds = await this.authorsRepository.getFollowerUserIds(book.author.id);
    const authorName = book.author.penName || book.author.user.firstName || 'Un auteur';
    await notificationsService.notifyFollowersNewBook(
      followerUserIds,
      book.title,
      book.id,
      authorName,
    );

    return result;
  }

  async rejectBook(id: string, reason: string) {
    // Get book details first for notification
    const book = await this.adminRepository.findBookById(id);
    if (!book) throw new NotFoundError('Book');

    const result = await this.adminRepository.updateBookStatus(id, 'REJECTED', reason);

    // Send notification to the author
    await notificationsService.notifyBookRejected(book.author.user.id, book.title, book.id, reason);

    return result;
  }

  async suspendBook(id: string) {
    return this.adminRepository.updateBookStatus(id, 'DRAFT');
  }

  async getBookDownloadLink(bookId: string, adminUserId: string) {
    const book = await this.adminRepository.findBookById(bookId);
    if (!book) throw new NotFoundError('Book');
    if (!book.fileUrl) throw new BadRequestError('Book has no file');

    const { url, expiresAt } = storageService.generateSignedUrl(book.fileUrl, adminUserId, bookId);
    return { downloadUrl: url, expiresAt };
  }

  // Categories
  async getCategories() {
    return this.adminRepository.findAllCategories();
  }

  async createCategory(data: CreateCategoryDto) {
    return this.adminRepository.createCategory(data);
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    return this.adminRepository.updateCategory(id, data);
  }

  async deleteCategory(id: string) {
    return this.adminRepository.deleteCategory(id);
  }

  // Reviews
  async getReviews(query: AdminReviewsQueryDto) {
    return this.adminRepository.findReviews(query);
  }

  async hideReview(id: string) {
    const review = await this.adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError('Review');
    return this.adminRepository.updateReviewStatus(id, 'HIDDEN');
  }

  async unhideReview(id: string) {
    const review = await this.adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError('Review');
    return this.adminRepository.updateReviewStatus(id, 'VISIBLE');
  }

  async deleteReview(id: string) {
    const review = await this.adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError('Review');
    return this.adminRepository.deleteReview(id);
  }

  // Transactions
  async getTransactions(query: AdminTransactionsQueryDto) {
    return this.adminRepository.findTransactions(query);
  }

  async getTransactionById(id: string) {
    const tx = await this.adminRepository.findTransactionById(id);
    if (!tx) throw new NotFoundError('Transaction');
    return tx;
  }
}
