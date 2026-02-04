import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_PATHS, COVERS_PUBLIC_URL } from '../../config/storage';
import { env } from '../../config/env';

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  format: string;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

export class StorageService {
  private readonly tokenSecret: string;
  private readonly tokenExpiration: number; // in seconds

  constructor() {
    this.tokenSecret = env.JWT_ACCESS_SECRET; // Reuse JWT secret for signing
    this.tokenExpiration = 15 * 60; // 15 minutes
  }

  /**
   * Save a cover image (public access via Nginx)
   */
  async saveCover(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    const ext = path.extname(originalName).toLowerCase() || this.getExtensionFromMime(mimeType);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(STORAGE_PATHS.covers, fileName);

    await fs.writeFile(filePath, buffer);

    return {
      url: `${COVERS_PUBLIC_URL}/${fileName}`,
      fileName,
      size: buffer.length,
      format: ext.replace('.', ''),
    };
  }

  /**
   * Save a book file (private, requires signed URL to access)
   */
  async saveBook(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    const ext = path.extname(originalName).toLowerCase() || this.getExtensionFromMime(mimeType);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(STORAGE_PATHS.books, fileName);

    await fs.writeFile(filePath, buffer);

    return {
      // Store only the filename, not a public URL
      url: fileName,
      fileName,
      size: buffer.length,
      format: ext.replace('.', ''),
    };
  }

  /**
   * Generate a signed URL for secure book download
   */
  generateSignedUrl(fileName: string, userId: string, bookId: string): SignedUrlResult {
    const expiresAt = Math.floor(Date.now() / 1000) + this.tokenExpiration;

    const payload = {
      fileName,
      userId,
      bookId,
      exp: expiresAt,
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(payloadBase64);
    const token = `${payloadBase64}.${signature}`;

    return {
      url: `/api/v1/files/download?token=${token}`,
      expiresAt: new Date(expiresAt * 1000),
    };
  }

  /**
   * Verify and decode a signed URL token
   */
  verifyToken(token: string): { fileName: string; userId: string; bookId: string } | null {
    try {
      const [payloadBase64, signature] = token.split('.');

      if (!payloadBase64 || !signature) {
        return null;
      }

      // Verify signature
      const expectedSignature = this.sign(payloadBase64);
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null;
      }

      // Decode and check expiration
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Token expired
      }

      return {
        fileName: payload.fileName,
        userId: payload.userId,
        bookId: payload.bookId,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get the full path to a book file
   */
  getBookPath(fileName: string): string {
    return path.join(STORAGE_PATHS.books, fileName);
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  /**
   * Delete a cover by URL
   */
  async deleteCover(coverUrl: string): Promise<void> {
    if (!coverUrl || !coverUrl.includes(COVERS_PUBLIC_URL)) return;
    const fileName = path.basename(coverUrl);
    const filePath = path.join(STORAGE_PATHS.covers, fileName);
    await this.deleteFile(filePath);
  }

  /**
   * Delete a book by filename
   */
  async deleteBook(fileName: string): Promise<void> {
    if (!fileName) return;
    const filePath = path.join(STORAGE_PATHS.books, fileName);
    await this.deleteFile(filePath);
  }

  private sign(data: string): string {
    return crypto.createHmac('sha256', this.tokenSecret).update(data).digest('base64url');
  }

  private getExtensionFromMime(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'application/epub+zip': '.epub',
    };
    return mimeMap[mimeType] || '';
  }
}

// Singleton instance
export const storageService = new StorageService();
