import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import {
  adminUsersQueryDto,
  adminAuthorsQueryDto,
  adminBooksQueryDto,
  adminTransactionsQueryDto,
} from './admin.dto';

const adminService = new AdminService();

export class AdminController {
  // Dashboard
  async getDashboard(_req: Request, res: Response) {
    const stats = await adminService.getDashboard();
    sendSuccess(res, stats);
  }

  // Users
  async getUsers(req: Request, res: Response) {
    const query = adminUsersQueryDto.parse(req.query);
    const { users, total } = await adminService.getUsers(query);
    sendPaginated(res, users, { page: query.page, limit: query.limit, total });
  }

  async getUserById(req: Request, res: Response) {
    const user = await adminService.getUserById(req.params.id as string);
    sendSuccess(res, user);
  }

  async suspendUser(req: Request, res: Response) {
    const user = await adminService.suspendUser(req.params.id as string);
    sendSuccess(res, user);
  }

  async banUser(req: Request, res: Response) {
    const user = await adminService.banUser(req.params.id as string);
    sendSuccess(res, user);
  }

  async activateUser(req: Request, res: Response) {
    const user = await adminService.activateUser(req.params.id as string);
    sendSuccess(res, user);
  }

  async promoteUser(req: Request, res: Response) {
    const user = await adminService.promoteUser(req.params.id as string);
    sendSuccess(res, user);
  }

  async demoteUser(req: Request, res: Response) {
    const user = await adminService.demoteUser(req.params.id as string, req.user!.userId);
    sendSuccess(res, user);
  }

  // Authors
  async getAuthors(req: Request, res: Response) {
    const query = adminAuthorsQueryDto.parse(req.query);
    const { authors, total } = await adminService.getAuthors(query);
    sendPaginated(res, authors, { page: query.page, limit: query.limit, total });
  }

  async approveAuthor(req: Request, res: Response) {
    const author = await adminService.approveAuthor(req.params.id as string);
    sendSuccess(res, author);
  }

  async rejectAuthor(req: Request, res: Response) {
    const author = await adminService.rejectAuthor(req.params.id as string);
    sendSuccess(res, author);
  }

  // Books
  async getBooks(req: Request, res: Response) {
    const query = adminBooksQueryDto.parse(req.query);
    const { books, total } = await adminService.getBooks(query);
    sendPaginated(res, books, { page: query.page, limit: query.limit, total });
  }

  async approveBook(req: Request, res: Response) {
    const book = await adminService.approveBook(req.params.id as string);
    sendSuccess(res, book);
  }

  async rejectBook(req: Request, res: Response) {
    const book = await adminService.rejectBook(req.params.id as string, req.body.reason);
    sendSuccess(res, book);
  }

  async suspendBook(req: Request, res: Response) {
    const book = await adminService.suspendBook(req.params.id as string);
    sendSuccess(res, book);
  }

  // Categories
  async getCategories(_req: Request, res: Response) {
    const categories = await adminService.getCategories();
    sendSuccess(res, categories);
  }

  async createCategory(req: Request, res: Response) {
    const category = await adminService.createCategory(req.body);
    sendSuccess(res, category, 201);
  }

  async updateCategory(req: Request, res: Response) {
    const category = await adminService.updateCategory(req.params.id as string, req.body);
    sendSuccess(res, category);
  }

  async deleteCategory(req: Request, res: Response) {
    await adminService.deleteCategory(req.params.id as string);
    sendSuccess(res, { message: 'Category deleted successfully' });
  }

  // Transactions
  async getTransactions(req: Request, res: Response) {
    const query = adminTransactionsQueryDto.parse(req.query);
    const { transactions, total } = await adminService.getTransactions(query);
    sendPaginated(res, transactions, { page: query.page, limit: query.limit, total });
  }
}
