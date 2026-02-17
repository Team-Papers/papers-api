import { AuthorsRepository } from './authors.repository';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors/app-error';
import { AuthorStatus } from '../../generated/prisma/enums';
import { notificationsService } from '../notifications/notifications.service';
import type { ApplyAuthorDto, UpdateAuthorDto } from './authors.dto';
import type { PaginationQuery } from '../../shared/utils/pagination';

export class AuthorsService {
  private authorsRepository: AuthorsRepository;

  constructor() {
    this.authorsRepository = new AuthorsRepository();
  }

  async apply(userId: string, data: ApplyAuthorDto) {
    const existing = await this.authorsRepository.findByUserId(userId);
    if (existing) {
      if (existing.status === AuthorStatus.APPROVED) {
        throw new ConflictError('You are already an approved author');
      }
      if (existing.status === AuthorStatus.PENDING) {
        throw new ConflictError('Your author application is already pending');
      }
    }

    const profile = await this.authorsRepository.create(userId, data);

    return profile;
  }

  async getMyProfile(userId: string) {
    const profile = await this.authorsRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Author profile');
    }
    return profile;
  }

  async updateMyProfile(userId: string, data: UpdateAuthorDto) {
    const profile = await this.authorsRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Author profile');
    }

    if (profile.status !== AuthorStatus.APPROVED) {
      throw new ForbiddenError('Only approved authors can update their profile');
    }

    return this.authorsRepository.update(userId, data);
  }

  async getPublicProfile(id: string) {
    const profile = await this.authorsRepository.findById(id);
    if (!profile || profile.status !== AuthorStatus.APPROVED) {
      throw new NotFoundError('Author');
    }

    const { balance: _balance, mtnNumber: _mtn, omNumber: _om, ...publicProfile } = profile;
    return publicProfile;
  }

  async listAuthors(query: PaginationQuery) {
    return this.authorsRepository.findAll(query);
  }

  async getMyStats(userId: string) {
    const profile = await this.authorsRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Author profile');
    }
    return this.authorsRepository.getStats(profile.id);
  }

  async getMyEarnings(userId: string, query: PaginationQuery) {
    const profile = await this.authorsRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Author profile');
    }
    return this.authorsRepository.getEarnings(profile.id, query);
  }

  // ---- Follow methods ----

  async followAuthor(userId: string, authorId: string) {
    const author = await this.authorsRepository.findById(authorId);
    if (!author || author.status !== AuthorStatus.APPROVED) {
      throw new NotFoundError('Author');
    }

    if (author.userId === userId) {
      throw new BadRequestError('You cannot follow yourself');
    }

    const alreadyFollowing = await this.authorsRepository.isFollowing(userId, authorId);
    if (alreadyFollowing) {
      throw new ConflictError('Already following this author');
    }

    await this.authorsRepository.follow(userId, authorId);

    // Notify the author about the new follower
    const followerUser = await this.authorsRepository.findUserById(userId);
    const followerName = followerUser?.firstName || followerUser?.email || 'Un lecteur';
    await notificationsService.notifyNewFollower(author.userId, followerName);
  }

  async unfollowAuthor(userId: string, authorId: string) {
    const author = await this.authorsRepository.findById(authorId);
    if (!author || author.status !== AuthorStatus.APPROVED) {
      throw new NotFoundError('Author');
    }

    await this.authorsRepository.unfollow(userId, authorId);
  }

  async isFollowing(userId: string, authorId: string) {
    return this.authorsRepository.isFollowing(userId, authorId);
  }

  async getFollowerCount(authorId: string) {
    return this.authorsRepository.getFollowerCount(authorId);
  }
}
