import { Request, Response } from 'express';
import { AuthorsService } from './authors.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { paginationSchema } from '../../shared/utils/pagination';

const authorsService = new AuthorsService();

export class AuthorsController {
  async apply(req: Request, res: Response) {
    const profile = await authorsService.apply(req.user!.userId, req.body);
    sendSuccess(res, profile, 201);
  }

  async getMyProfile(req: Request, res: Response) {
    const profile = await authorsService.getMyProfile(req.user!.userId);
    sendSuccess(res, profile);
  }

  async updateMyProfile(req: Request, res: Response) {
    const profile = await authorsService.updateMyProfile(req.user!.userId, req.body);
    sendSuccess(res, profile);
  }

  async getPublicProfile(req: Request, res: Response) {
    const profile = await authorsService.getPublicProfile(req.params.id as string);
    sendSuccess(res, profile);
  }

  async listAuthors(req: Request, res: Response) {
    const query = paginationSchema.parse(req.query);
    const { authors, total } = await authorsService.listAuthors(query);
    sendPaginated(res, authors, { page: query.page, limit: query.limit, total });
  }

  async getMyStats(req: Request, res: Response) {
    const stats = await authorsService.getMyStats(req.user!.userId);
    sendSuccess(res, stats);
  }

  async getMyEarnings(req: Request, res: Response) {
    const query = paginationSchema.parse(req.query);
    const { balance, transactions, total } = await authorsService.getMyEarnings(
      req.user!.userId,
      query,
    );
    sendSuccess(res, {
      balance,
      transactions,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  }
}
