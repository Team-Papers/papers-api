import { z } from 'zod/v4';

export const registerDto = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
});

export const loginDto = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthDto = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export const refreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordDto = z.object({
  email: z.email('Invalid email address'),
});

export const resetPasswordDto = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const verifyEmailDto = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type GoogleAuthDto = z.infer<typeof googleAuthDto>;
export type RefreshTokenDto = z.infer<typeof refreshTokenDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
export type VerifyEmailDto = z.infer<typeof verifyEmailDto>;
