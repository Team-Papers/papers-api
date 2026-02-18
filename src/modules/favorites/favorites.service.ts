import { FavoritesRepository } from './favorites.repository';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error';

const favoritesRepository = new FavoritesRepository();

export class FavoritesService {
  async getFavorites(userId: string) {
    return favoritesRepository.findByUser(userId);
  }

  async isFavorite(userId: string, bookId: string) {
    const favorite = await favoritesRepository.findByUserAndBook(userId, bookId);
    return { isFavorite: !!favorite };
  }

  async addFavorite(userId: string, bookId: string) {
    const existing = await favoritesRepository.findByUserAndBook(userId, bookId);
    if (existing) {
      throw new ConflictError('Book is already in favorites');
    }
    return favoritesRepository.create(userId, bookId);
  }

  async removeFavorite(userId: string, bookId: string) {
    const existing = await favoritesRepository.findByUserAndBook(userId, bookId);
    if (!existing) {
      throw new NotFoundError('Favorite');
    }
    return favoritesRepository.delete(userId, bookId);
  }
}

export const favoritesService = new FavoritesService();
