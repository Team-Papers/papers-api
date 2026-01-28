import { Router } from 'express';
import { AuthorsController } from './authors.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { applyAuthorDto, updateAuthorDto } from './authors.dto';

const router = Router();
const controller = new AuthorsController();

router.post('/apply', authenticate, validate(applyAuthorDto), (req, res, next) => {
  controller.apply(req, res).catch(next);
});

router.get('/me', authenticate, (req, res, next) => {
  controller.getMyProfile(req, res).catch(next);
});

router.put('/me', authenticate, validate(updateAuthorDto), (req, res, next) => {
  controller.updateMyProfile(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  controller.listAuthors(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  controller.getPublicProfile(req, res).catch(next);
});

export default router;
