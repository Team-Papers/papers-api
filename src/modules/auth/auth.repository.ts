import prisma from '../../config/database';
import { Role } from '../../generated/prisma/enums';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
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
        googleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
  }

  async createUser(data: {
    email: string;
    passwordHash?: string;
    googleId?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    role?: Role;
    emailVerified?: boolean;
  }) {
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: { emailVerified?: boolean; passwordHash?: string }) {
    return prisma.user.update({ where: { id }, data });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
