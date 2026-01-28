import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateUserDto } from './users.dto';

const router = Router();
const controller = new UsersController();

router.get('/:id', (req, res, next) => {
  controller.getProfile(req, res).catch(next);
});

router.put('/:id', authenticate, validate(updateUserDto), (req, res, next) => {
  controller.updateProfile(req, res).catch(next);
});

router.delete('/:id', authenticate, (req, res, next) => {
  controller.deleteAccount(req, res).catch(next);
});

export default router;
