import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateUserDto, syncInterestsDto } from './users.dto';

const router = Router();
const controller = new UsersController();

router.put('/me/interests', authenticate, validate(syncInterestsDto), (req, res, next) => {
  controller.syncInterests(req, res).catch(next);
});

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
