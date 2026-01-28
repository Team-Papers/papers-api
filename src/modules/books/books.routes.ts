import { Router } from 'express';
import { BooksController } from './books.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createBookDto, updateBookDto } from './books.dto';

const router = Router();
const controller = new BooksController();

// Public routes
router.get('/', (req, res, next) => {
  controller.getCatalogue(req, res).catch(next);
});

router.get('/search', (req, res, next) => {
  controller.search(req, res).catch(next);
});

// Authenticated author routes (must be before /:id)
router.get('/me', authenticate, (req, res, next) => {
  controller.getMyBooks(req, res).catch(next);
});

router.post('/', authenticate, validate(createBookDto), (req, res, next) => {
  controller.create(req, res).catch(next);
});

// Public routes with :id
router.get('/:id', (req, res, next) => {
  controller.getById(req, res).catch(next);
});

router.get('/:id/preview', (req, res, next) => {
  controller.getPreview(req, res).catch(next);
});

// Authenticated author routes with :id
router.put('/:id', authenticate, validate(updateBookDto), (req, res, next) => {
  controller.update(req, res).catch(next);
});

router.delete('/:id', authenticate, (req, res, next) => {
  controller.delete(req, res).catch(next);
});

router.post('/:id/submit', authenticate, (req, res, next) => {
  controller.submit(req, res).catch(next);
});

export default router;
