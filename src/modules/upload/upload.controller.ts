import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { BadRequestError } from '../../shared/errors/app-error';
import { storageService } from '../../shared/services/storage.service';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_BOOK_TYPES = ['application/pdf', 'application/epub+zip'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BOOK_SIZE = 100 * 1024 * 1024; // 100MB

export class UploadController {
  async uploadCover(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      throw new BadRequestError('No file provided');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestError('Invalid file type. Allowed: JPG, PNG, WebP');
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestError('File too large. Maximum size: 5MB');
    }

    const result = await storageService.saveCover(file.buffer, file.originalname, file.mimetype);

    sendSuccess(res, { url: result.url }, 201);
  }

  async uploadBook(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      throw new BadRequestError('No file provided');
    }

    if (!ALLOWED_BOOK_TYPES.includes(file.mimetype)) {
      throw new BadRequestError('Invalid file type. Allowed: PDF, ePub');
    }

    if (file.size > MAX_BOOK_SIZE) {
      throw new BadRequestError('File too large. Maximum size: 100MB');
    }

    const result = await storageService.saveBook(file.buffer, file.originalname, file.mimetype);

    sendSuccess(
      res,
      {
        url: result.url, // This is now just the filename for private storage
        size: result.size,
        format: result.format,
      },
      201,
    );
  }
}
