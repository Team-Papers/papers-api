import { AdminRepository } from './admin.repository';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error';
import type {
  AdminUsersQueryDto,
  AdminAuthorsQueryDto,
  AdminBooksQueryDto,
  AdminTransactionsQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './admin.dto';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async getDashboard() {
    return this.adminRepository.getDashboardStats();
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

  // Authors
  async getAuthors(query: AdminAuthorsQueryDto) {
    return this.adminRepository.findAuthors(query);
  }

  async approveAuthor(id: string) {
    return this.adminRepository.updateAuthorStatus(id, 'APPROVED');
  }

  async rejectAuthor(id: string) {
    return this.adminRepository.updateAuthorStatus(id, 'REJECTED');
  }

  // Books
  async getBooks(query: AdminBooksQueryDto) {
    return this.adminRepository.findBooks(query);
  }

  async approveBook(id: string) {
    return this.adminRepository.updateBookStatus(id, 'PUBLISHED');
  }

  async rejectBook(id: string, reason: string) {
    return this.adminRepository.updateBookStatus(id, 'REJECTED', reason);
  }

  async suspendBook(id: string) {
    return this.adminRepository.updateBookStatus(id, 'DRAFT');
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

  // Transactions
  async getTransactions(query: AdminTransactionsQueryDto) {
    return this.adminRepository.findTransactions(query);
  }
}
