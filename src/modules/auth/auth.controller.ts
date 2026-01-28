import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../shared/utils/response';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  }

  async googleAuth(req: Request, res: Response) {
    const result = await authService.googleAuth(req.body);
    sendSuccess(res, result);
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    sendSuccess(res, result);
  }

  async forgotPassword(req: Request, res: Response) {
    await authService.forgotPassword(req.body);
    sendSuccess(res, { message: 'If an account exists, a reset email has been sent' });
  }

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body);
    sendSuccess(res, { message: 'Password reset successfully' });
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.body;
    await authService.verifyEmail(token);
    sendSuccess(res, { message: 'Email verified successfully' });
  }

  async getMe(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.userId);
    sendSuccess(res, user);
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken, req.user!.userId);
    sendSuccess(res, { message: 'Logged out successfully' });
  }
}
