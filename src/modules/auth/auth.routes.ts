import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authLimiter } from '../../shared/middleware/rate-limiter.middleware';
import {
  registerDto,
  loginDto,
  googleAuthDto,
  refreshTokenDto,
  forgotPasswordDto,
  resetPasswordDto,
  verifyEmailDto,
} from './auth.dto';

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, validate(registerDto), (req, res, next) => {
  controller.register(req, res).catch(next);
});

router.post('/login', authLimiter, validate(loginDto), (req, res, next) => {
  controller.login(req, res).catch(next);
});

router.post('/google', authLimiter, validate(googleAuthDto), (req, res, next) => {
  controller.googleAuth(req, res).catch(next);
});

router.post('/refresh', validate(refreshTokenDto), (req, res, next) => {
  controller.refreshToken(req, res).catch(next);
});

router.post('/forgot-password', authLimiter, validate(forgotPasswordDto), (req, res, next) => {
  controller.forgotPassword(req, res).catch(next);
});

router.post('/reset-password', validate(resetPasswordDto), (req, res, next) => {
  controller.resetPassword(req, res).catch(next);
});

router.post('/verify-email', validate(verifyEmailDto), (req, res, next) => {
  controller.verifyEmail(req, res).catch(next);
});

router.get('/me', authenticate, (req, res, next) => {
  controller.getMe(req, res).catch(next);
});

router.post('/logout', authenticate, (req, res, next) => {
  controller.logout(req, res).catch(next);
});

export default router;
