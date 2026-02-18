import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import { sendSuccess } from '../../shared/utils/response';
import { paginationSchema } from '../../shared/utils/pagination';

const reviewsService = new ReviewsService();

export class ReviewsController {
  async getBookReviews(req: Request, res: Response) {
    const query = paginationSchema.parse(req.query);
    const userId = req.user?.userId;
    const { reviews, total, averageRating, totalRatings, userReview, ratingDistribution } =
      await reviewsService.getBookReviews(req.params.id as string, query, userId);
    sendSuccess(res, {
      reviews,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
      averageRating,
      totalRatings,
      userReview,
      ratingDistribution,
    });
  }

  async createReview(req: Request, res: Response) {
    const review = await reviewsService.createReview(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );
    sendSuccess(res, review, 201);
  }

  async updateReview(req: Request, res: Response) {
    const review = await reviewsService.updateReview(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );
    sendSuccess(res, review);
  }

  async deleteReview(req: Request, res: Response) {
    await reviewsService.deleteReview(req.user!.userId, req.params.id as string);
    sendSuccess(res, { message: 'Review deleted successfully' });
  }
}
