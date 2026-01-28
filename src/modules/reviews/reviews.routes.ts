import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createReviewDto, updateReviewDto } from './reviews.dto';

const router = Router();
const controller = new ReviewsController();

// Book reviews (nested under /books/:id/reviews in app.ts)
router.get('/books/:id/reviews', (req, res, next) => {
  controller.getBookReviews(req, res).catch(next);
});

router.post('/books/:id/reviews', authenticate, validate(createReviewDto), (req, res, next) => {
  controller.createReview(req, res).catch(next);
});

// Review management
router.put('/:id', authenticate, validate(updateReviewDto), (req, res, next) => {
  controller.updateReview(req, res).catch(next);
});

router.delete('/:id', authenticate, (req, res, next) => {
  controller.deleteReview(req, res).catch(next);
});

export default router;
