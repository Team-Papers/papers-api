import { AuthorsRepository } from './authors.repository';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/app-error';
import { AuthorStatus } from '../../generated/prisma/enums';
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
}
