import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';
import { firebaseAuth, isFirebaseConfigured } from '../../config/firebase';
import redis from '../../config/redis';
import { AuthRepository } from './auth.repository';
import { JwtPayload } from '../../shared/middleware/auth.middleware';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../shared/errors/app-error';
import { UserStatus } from '../../generated/prisma/enums';
import type {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.dto';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(data: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.authRepository.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await redis.setex(`verify:${verificationToken}`, 24 * 60 * 60, user.id);

    // TODO: Send verification email (Sprint 1 - Email Service)

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  async login(data: LoginDto) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is suspended or banned');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  async googleAuth(data: GoogleAuthDto) {
    if (!isFirebaseConfigured || !firebaseAuth) {
      throw new BadRequestError('Google authentication is not configured');
    }

    const decodedToken = await firebaseAuth.verifyIdToken(data.idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      throw new BadRequestError('Google account must have an email');
    }

    let user = await this.authRepository.findUserByGoogleId(uid);

    if (!user) {
      const existingUser = await this.authRepository.findUserByEmail(email);
      if (existingUser) {
        // Link Google account to existing user
        await this.authRepository.updateUser(existingUser.id, {
          googleId: uid,
          emailVerified: true,
          avatarUrl: existingUser.avatarUrl || picture,
        });
        user = (await this.authRepository.findUserByEmail(email))!;
      } else {
        const nameParts = (name || '').split(' ');
        user = await this.authRepository.createUser({
          email,
          googleId: uid,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          avatarUrl: picture,
          emailVerified: true,
        });
      }
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is suspended or banned');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const stored = await this.authRepository.findRefreshToken(refreshToken);
    if (!stored) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(refreshToken);
      throw new UnauthorizedError('Refresh token expired');
    }

    if (stored.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is suspended or banned');
    }

    await this.authRepository.deleteRefreshToken(refreshToken);
    const tokens = await this.generateTokens(stored.user.id, stored.user.email, stored.user.role);

    return tokens;
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await redis.setex(`reset:${resetToken}`, 60 * 60, user.id);

    // TODO: Send reset password email
  }

  async resetPassword(data: ResetPasswordDto) {
    const userId = await redis.get(`reset:${data.token}`);
    if (!userId) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Verify user still exists before updating
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      await redis.del(`reset:${data.token}`);
      throw new BadRequestError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    await this.authRepository.updateUser(userId, { passwordHash });
    await redis.del(`reset:${data.token}`);
    await this.authRepository.deleteUserRefreshTokens(userId);
  }

  async verifyEmail(token: string) {
    const userId = await redis.get(`verify:${token}`);
    if (!userId) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    // Verify user still exists before updating
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      await redis.del(`verify:${token}`);
      throw new BadRequestError('Invalid or expired verification token');
    }

    await this.authRepository.updateUser(userId, { emailVerified: true });
    await redis.del(`verify:${token}`);
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  async logout(refreshToken: string, userId: string) {
    if (refreshToken) {
      await this.authRepository.deleteRefreshToken(refreshToken);
    } else {
      await this.authRepository.deleteUserRefreshTokens(userId);
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { userId, email, role: role as JwtPayload['role'] };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRATION as string & { __brand: 'StringValue' },
    } as jwt.SignOptions);

    const refreshTokenValue = crypto.randomBytes(40).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createRefreshToken(userId, refreshTokenValue, expiresAt);

    return { accessToken, refreshToken: refreshTokenValue };
  }
}
