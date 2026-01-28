import { Router } from 'express';
import { CategoriesController } from './categories.controller';

const router = Router();
const controller = new CategoriesController();

router.get('/', (req, res, next) => {
  controller.getAll(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  controller.getById(req, res).catch(next);
});

router.get('/:id/books', (req, res, next) => {
  controller.getBooksByCategory(req, res).catch(next);
});

export default router;
