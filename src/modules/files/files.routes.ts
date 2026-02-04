import { Router } from 'express';
import { FilesController } from './files.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new FilesController();

// Public route - uses signed token for authentication
router.get('/download', (req, res, next) => {
  controller.downloadBook(req, res).catch(next);
});

// Protected route - requires JWT authentication
router.post('/generate-link', authenticate, (req, res, next) => {
  controller.generateDownloadLink(req, res).catch(next);
});

export default router;
