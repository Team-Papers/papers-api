import { Router } from 'express';
import { PurchasesController } from './purchases.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createPurchaseDto } from './purchases.dto';

const router = Router();
const controller = new PurchasesController();

router.post('/', authenticate, validate(createPurchaseDto), (req, res, next) => {
  controller.create(req, res).catch(next);
});

router.get('/', authenticate, (req, res, next) => {
  controller.getMyPurchases(req, res).catch(next);
});

router.get('/:id', authenticate, (req, res, next) => {
  controller.getById(req, res).catch(next);
});

// Polling endpoint for mobile (lightweight status check)
router.get('/:id/status', authenticate, (req, res, next) => {
  controller.getStatus(req, res).catch(next);
});

// Dev only: mock payment completion
router.post('/:id/mock-complete', authenticate, (req, res, next) => {
  controller.mockComplete(req, res).catch(next);
});

export default router;
