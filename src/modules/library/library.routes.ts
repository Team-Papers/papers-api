import { Router } from 'express';
import { LibraryController } from './library.controller';
import { BookmarksController } from '../bookmarks/bookmarks.controller';
import { FavoritesController } from '../favorites/favorites.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateProgressDto } from './library.dto';
import { createBookmarkDto } from '../bookmarks/bookmarks.dto';

const router = Router();
const libraryController = new LibraryController();
const bookmarksController = new BookmarksController();
const favoritesController = new FavoritesController();

router.get('/', authenticate, (req, res, next) => {
  libraryController.getMyLibrary(req, res).catch(next);
});

// Favorites (MUST be before /:bookId to avoid "favorites" being captured as a bookId)
router.get('/favorites', authenticate, (req, res, next) => {
  favoritesController.getFavorites(req, res).catch(next);
});

router.get('/:bookId', authenticate, (req, res, next) => {
  libraryController.getBookDetail(req, res).catch(next);
});

router.post('/:bookId/download', authenticate, (req, res, next) => {
  libraryController.getDownloadUrl(req, res).catch(next);
});

router.put('/:bookId/progress', authenticate, validate(updateProgressDto), (req, res, next) => {
  libraryController.updateProgress(req, res).catch(next);
});

// Bookmarks nested under library
router.get('/:bookId/bookmarks', authenticate, (req, res, next) => {
  bookmarksController.getBookmarks(req, res).catch(next);
});

router.post('/:bookId/bookmarks', authenticate, validate(createBookmarkDto), (req, res, next) => {
  bookmarksController.createBookmark(req, res).catch(next);
});

router.delete('/:bookId/bookmarks/:id', authenticate, (req, res, next) => {
  bookmarksController.deleteBookmark(req, res).catch(next);
});

// Favorites per book
router.get('/:bookId/favorite', authenticate, (req, res, next) => {
  favoritesController.checkFavorite(req, res).catch(next);
});

router.post('/:bookId/favorite', authenticate, (req, res, next) => {
  favoritesController.addFavorite(req, res).catch(next);
});

router.delete('/:bookId/favorite', authenticate, (req, res, next) => {
  favoritesController.removeFavorite(req, res).catch(next);
});

export default router;
