import { Request, Response } from 'express';
import { favoritesService } from './favorites.service';
import { sendSuccess } from '../../shared/utils/response';

export class FavoritesController {
  async getFavorites(req: Request, res: Response) {
    const favorites = await favoritesService.getFavorites(req.user!.userId);
    sendSuccess(res, favorites);
  }

  async checkFavorite(req: Request, res: Response) {
    const result = await favoritesService.isFavorite(req.user!.userId, req.params.bookId as string);
    sendSuccess(res, result);
  }

  async addFavorite(req: Request, res: Response) {
    const favorite = await favoritesService.addFavorite(
      req.user!.userId,
      req.params.bookId as string,
    );
    sendSuccess(res, favorite, 201);
  }

  async removeFavorite(req: Request, res: Response) {
    await favoritesService.removeFavorite(req.user!.userId, req.params.bookId as string);
    sendSuccess(res, { message: 'Favorite removed successfully' });
  }
}
