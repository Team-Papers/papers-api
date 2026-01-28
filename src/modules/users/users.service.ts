import { UsersRepository } from './users.repository';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';
import type { UpdateUserDto } from './users.dto';

export class UsersService {
  private usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async getProfile(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  async updateProfile(id: string, data: UpdateUserDto, requesterId: string) {
    if (id !== requesterId) {
      throw new ForbiddenError('You can only update your own profile');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    return this.usersRepository.update(id, data);
  }

  async deleteAccount(id: string, requesterId: string) {
    if (id !== requesterId) {
      throw new ForbiddenError('You can only delete your own account');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    await this.usersRepository.delete(id);
  }
}
