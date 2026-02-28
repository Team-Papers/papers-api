import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { storageService } from '../../shared/services/storage.service';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../shared/errors/app-error';
import prisma from '../../config/database';

export class FilesController {
  /**
   * Download or view a book file using a signed token
   * GET /api/v1/files/download?token=xxx&inline=true
   * Use inline=true for PDF preview in browser
   */
  async downloadBook(req: Request, res: Response) {
    const { token, inline } = req.query;

    if (!token || typeof token !== 'string') {
      throw new BadRequestError('Download token is required');
    }

    // Verify the token
    const payload = storageService.verifyToken(token);

    if (!payload) {
      throw new ForbiddenError('Invalid or expired download link');
    }

    // Get the file path
    const filePath = storageService.getBookPath(payload.fileName);

    // Check if file exists and get its size
    let fileStat: fs.Stats;
    try {
      fileStat = fs.statSync(filePath);
    } catch {
      throw new NotFoundError('File');
    }

    if (!fileStat.isFile() || fileStat.size === 0) {
      throw new NotFoundError('File');
    }

    // Get book info for filename
    const book = await prisma.book.findUnique({
      where: { id: payload.bookId },
      select: { title: true, fileFormat: true },
    });

    // Sanitize filename for download
    const safeTitle = (book?.title || 'book')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const ext = path.extname(payload.fileName);
    const downloadName = `${safeTitle}${ext}`;

    // Set headers - use inline for preview or attachment for download
    const disposition = inline === 'true' ? 'inline' : `attachment; filename="${downloadName}"`;
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Content-Type', this.getMimeType(ext));
    res.setHeader('Content-Length', fileStat.size);
    res.setHeader('Cache-Control', 'private, no-cache');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.removeHeader('X-Frame-Options');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (err) => {
      console.error(`❌ File stream error for ${payload.fileName}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'File read error' });
      } else {
        res.destroy();
      }
    });

    fileStream.pipe(res);

    // Log the access
    console.log(
      `📥 ${inline === 'true' ? 'Preview' : 'Download'}: ${payload.fileName} (${fileStat.size} bytes) by user ${payload.userId}`,
    );
  }

  /**
   * Generate a download link for a purchased book
   * POST /api/v1/files/generate-link
   * Body: { bookId: string }
   */
  async generateDownloadLink(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { bookId } = req.body;

    if (!bookId) {
      throw new BadRequestError('Book ID is required');
    }

    // Check if user has purchased this book or is the author
    const [purchase, book] = await Promise.all([
      prisma.purchase.findFirst({
        where: {
          userId,
          bookId,
          status: 'COMPLETED',
        },
      }),
      prisma.book.findUnique({
        where: { id: bookId },
        include: {
          author: {
            select: { userId: true },
          },
        },
      }),
    ]);

    if (!book) {
      throw new NotFoundError('Book');
    }

    // Allow access if user purchased the book OR is the author
    const isAuthor = book.author.userId === userId;
    const hasPurchased = !!purchase;

    if (!hasPurchased && !isAuthor) {
      throw new ForbiddenError('You must purchase this book to download it');
    }

    if (!book.fileUrl) {
      throw new NotFoundError('Book file not available');
    }

    // Generate signed URL
    const { url, expiresAt } = storageService.generateSignedUrl(
      book.fileUrl, // This is the filename stored in DB
      userId,
      bookId,
    );

    res.json({
      success: true,
      data: {
        downloadUrl: url,
        expiresAt: expiresAt.toISOString(),
        expiresIn: '15 minutes',
      },
    });
  }

  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.epub': 'application/epub+zip',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
}
