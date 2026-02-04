import { Router } from 'express';
import { LibraryController } from './library.controller';
import { BookmarksController } from '../bookmarks/bookmarks.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateProgressDto } from './library.dto';
import { createBookmarkDto } from '../bookmarks/bookmarks.dto';

const router = Router();
const libraryController = new LibraryController();
const bookmarksController = new BookmarksController();

router.get('/', authenticate, (req, res, next) => {
  libraryController.getMyLibrary(req, res).catch(next);
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

export default router;
