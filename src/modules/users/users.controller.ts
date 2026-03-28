import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { sendSuccess } from '../../shared/utils/response';

const usersService = new UsersService();

export class UsersController {
  async getProfile(req: Request, res: Response) {
    const user = await usersService.getProfile(req.params.id as string);
    sendSuccess(res, user);
  }

  async updateProfile(req: Request, res: Response) {
    const user = await usersService.updateProfile(
      req.params.id as string,
      req.body,
      req.user!.userId,
    );
    sendSuccess(res, user);
  }

  async deleteAccount(req: Request, res: Response) {
    await usersService.deleteAccount(req.params.id as string, req.user!.userId);
    sendSuccess(res, { message: 'Account deleted successfully' });
  }

  async syncInterests(req: Request, res: Response) {
    await usersService.syncInterests(req.user!.userId, req.body.categoryIds);
    sendSuccess(res, { message: 'Interests synced successfully' });
  }

  async updateFcmToken(req: Request, res: Response) {
    await usersService.updateFcmToken(req.user!.userId, req.body.fcmToken);
    sendSuccess(res, { message: 'FCM token updated successfully' });
  }

  async updatePreferences(req: Request, res: Response) {
    const user = await usersService.updatePreferences(req.user!.userId, req.body);
    sendSuccess(res, user);
  }
}
