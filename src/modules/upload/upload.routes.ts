import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new UploadController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post('/cover', authenticate, upload.single('file'), (req, res, next) => {
  controller.uploadCover(req, res).catch(next);
});

router.post('/book', authenticate, upload.single('file'), (req, res, next) => {
  controller.uploadBook(req, res).catch(next);
});

export default router;
