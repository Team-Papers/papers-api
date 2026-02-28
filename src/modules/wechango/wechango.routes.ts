import { Router } from 'express';
import express from 'express';
import { WechangoWebhookController } from './wechango.webhook.controller';

const router = Router();
const controller = new WechangoWebhookController();

// Webhook endpoint — uses raw body for HMAC signature verification
// No JWT auth required (Wechango calls this directly)
router.post('/wechango', express.raw({ type: 'application/json' }), (req, res, next) => {
  controller.handleWebhook(req, res).catch(next);
});

export default router;
