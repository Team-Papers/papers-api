import { Router } from 'express';
import { BlogController } from './blog.controller';
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createArticleDto, updateArticleDto } from './blog.dto';

const router = Router();
const controller = new BlogController();

// ---- Public routes (for mobile app + showcase) ----

// GET /blog - Published articles list
router.get('/', (req, res, next) => {
  controller.getPublished(req, res).catch(next);
});

// GET /blog/:slug - Single published article by slug
router.get('/slug/:slug', optionalAuthenticate, (req, res, next) => {
  controller.getBySlug(req, res).catch(next);
});

// POST /blog/:id/like - Toggle like (authenticated)
router.post('/:id/like', authenticate, (req, res, next) => {
  controller.toggleLike(req, res).catch(next);
});

// ---- Admin routes ----

// GET /blog/admin - All articles (any status)
router.get('/admin', authenticate, authorize('ADMIN'), (req, res, next) => {
  controller.getAll(req, res).catch(next);
});

// GET /blog/admin/:id - Single article by id
router.get('/admin/:id', authenticate, authorize('ADMIN'), (req, res, next) => {
  controller.getById(req, res).catch(next);
});

// POST /blog/admin - Create article
router.post(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  validate(createArticleDto),
  (req, res, next) => {
    controller.create(req, res).catch(next);
  },
);

// PATCH /blog/admin/:id - Update article
router.patch(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateArticleDto),
  (req, res, next) => {
    controller.update(req, res).catch(next);
  },
);

// DELETE /blog/admin/:id - Delete article
router.delete('/admin/:id', authenticate, authorize('ADMIN'), (req, res, next) => {
  controller.delete(req, res).catch(next);
});

export default router;
