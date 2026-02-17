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

router.get('/me/stats', authenticate, (req, res, next) => {
  controller.getMyStats(req, res).catch(next);
});

router.get('/me/earnings', authenticate, (req, res, next) => {
  controller.getMyEarnings(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  controller.listAuthors(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  controller.getPublicProfile(req, res).catch(next);
});

// Follow routes
router.post('/:id/follow', authenticate, (req, res, next) => {
  controller.follow(req, res).catch(next);
});

router.delete('/:id/follow', authenticate, (req, res, next) => {
  controller.unfollow(req, res).catch(next);
});

router.get('/:id/is-following', authenticate, (req, res, next) => {
  controller.checkFollowing(req, res).catch(next);
});

router.get('/:id/followers/count', (req, res, next) => {
  controller.getFollowerCount(req, res).catch(next);
});

export default router;
