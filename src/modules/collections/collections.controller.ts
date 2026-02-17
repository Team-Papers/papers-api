import { Request, Response } from 'express';
import { CollectionsService } from './collections.service';
import { sendSuccess } from '../../shared/utils/response';

const collectionsService = new CollectionsService();

export class CollectionsController {
  // Public routes
  async getAll(_req: Request, res: Response) {
    const collections = await collectionsService.getAll();
    sendSuccess(res, collections);
  }

  async getById(req: Request, res: Response) {
    const collection = await collectionsService.getById(req.params.id as string);
    sendSuccess(res, collection);
  }

  // Admin routes
  async getAllAdmin(_req: Request, res: Response) {
    const collections = await collectionsService.getAllAdmin();
    sendSuccess(res, collections);
  }

  async create(req: Request, res: Response) {
    const collection = await collectionsService.create(req.body);
    sendSuccess(res, collection, 201);
  }

  async update(req: Request, res: Response) {
    const collection = await collectionsService.update(req.params.id as string, req.body);
    sendSuccess(res, collection);
  }

  async delete(req: Request, res: Response) {
    await collectionsService.delete(req.params.id as string);
    sendSuccess(res, { message: 'Collection deleted successfully' });
  }

  async addBook(req: Request, res: Response) {
    const { bookId, orderIndex } = req.body;
    const result = await collectionsService.addBook(req.params.id as string, bookId, orderIndex);
    sendSuccess(res, result, 201);
  }

  async removeBook(req: Request, res: Response) {
    await collectionsService.removeBook(req.params.id as string, req.params.bookId as string);
    sendSuccess(res, { message: 'Book removed from collection' });
  }
}
