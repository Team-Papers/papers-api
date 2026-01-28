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
    const user = await usersService.updateProfile(req.params.id as string, req.body, req.user!.userId);
    sendSuccess(res, user);
  }

  async deleteAccount(req: Request, res: Response) {
    await usersService.deleteAccount(req.params.id as string, req.user!.userId);
    sendSuccess(res, { message: 'Account deleted successfully' });
  }
}
