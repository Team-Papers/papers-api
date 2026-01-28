import { ReviewsRepository } from './reviews.repository';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/app-error';
import type { CreateReviewDto, UpdateReviewDto } from './reviews.dto';
import type { PaginationQuery } from '../../shared/utils/pagination';

export class ReviewsService {
  private reviewsRepository: ReviewsRepository;

  constructor() {
    this.reviewsRepository = new ReviewsRepository();
  }

  async getBookReviews(bookId: string, query: PaginationQuery) {
    const [data, stats] = await Promise.all([
      this.reviewsRepository.findByBookId(bookId, query),
      this.reviewsRepository.getAverageRating(bookId),
    ]);

    return { ...data, averageRating: stats.average, totalRatings: stats.count };
  }

  async createReview(userId: string, bookId: string, data: CreateReviewDto) {
    const existing = await this.reviewsRepository.findByUserAndBook(userId, bookId);
    if (existing) {
      throw new ConflictError('You have already reviewed this book');
    }

    return this.reviewsRepository.create(userId, bookId, data.rating, data.comment);
  }

  async updateReview(userId: string, reviewId: string, data: UpdateReviewDto) {
    const review = await this.reviewsRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review');
    }
    if (review.userId !== userId) {
      throw new ForbiddenError('You can only edit your own reviews');
    }

    return this.reviewsRepository.update(reviewId, data.rating, data.comment);
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.reviewsRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review');
    }
    if (review.userId !== userId) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    return this.reviewsRepository.delete(reviewId);
  }
}
