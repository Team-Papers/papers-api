import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { BadRequestError } from '../../shared/errors/app-error';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

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

    const ext = path.extname(file.originalname);
    const fileName = `covers/${uuidv4()}${ext}`;

    const bucket = getStorage().bucket();
    const blob = bucket.file(fileName);

    await blob.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    await blob.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    sendSuccess(res, { url: publicUrl }, 201);
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

    // TODO: Replace with Cloudflare R2 when keys are available
    const ext = path.extname(file.originalname);
    const fileName = `books/${uuidv4()}${ext}`;

    const bucket = getStorage().bucket();
    const blob = bucket.file(fileName);

    await blob.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    await blob.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    sendSuccess(
      res,
      {
        url: publicUrl,
        size: file.size,
        format: ext.replace('.', ''),
      },
      201,
    );
  }
}
