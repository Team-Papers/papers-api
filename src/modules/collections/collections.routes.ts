import { Router } from 'express';
import { CollectionsController } from './collections.controller';

const router = Router();
const controller = new CollectionsController();

// Public routes
router.get('/', (req, res, next) => {
  controller.getAll(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  controller.getById(req, res).catch(next);
});

export default router;
