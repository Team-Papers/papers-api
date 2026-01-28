import { Request, Response } from 'express';
import { PurchasesService } from './purchases.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { paginationSchema } from '../../shared/utils/pagination';

const purchasesService = new PurchasesService();

export class PurchasesController {
  async create(req: Request, res: Response) {
    const purchase = await purchasesService.create(req.user!.userId, req.body);
    sendSuccess(res, purchase, 201);
  }

  async getMyPurchases(req: Request, res: Response) {
    const query = paginationSchema.parse(req.query);
    const { purchases, total } = await purchasesService.getMyPurchases(req.user!.userId, query);
    sendPaginated(res, purchases, { page: query.page, limit: query.limit, total });
  }

  async getById(req: Request, res: Response) {
    const purchase = await purchasesService.getById(req.user!.userId, req.params.id as string);
    sendSuccess(res, purchase);
  }

  async mockComplete(req: Request, res: Response) {
    const purchase = await purchasesService.mockComplete(req.params.id as string);
    sendSuccess(res, purchase);
  }
}
