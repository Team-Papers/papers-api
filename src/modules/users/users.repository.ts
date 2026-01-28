import prisma from '../../config/database';
import type { UpdateUserDto } from './users.dto';

export class UsersRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        authorProfile: {
          select: {
            id: true,
            penName: true,
            status: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
