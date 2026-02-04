import path from 'path';
import fs from 'fs/promises';
import { env } from './env';

// Base storage path - configurable via env
export const STORAGE_BASE_PATH = env.STORAGE_PATH || '/var/www/papers-storage';

export const STORAGE_PATHS = {
  covers: path.join(STORAGE_BASE_PATH, 'covers'),
  books: path.join(STORAGE_BASE_PATH, 'books'),
  temp: path.join(STORAGE_BASE_PATH, 'temp'),
};

// Public URL base for covers (served by Nginx)
export const COVERS_PUBLIC_URL = env.COVERS_PUBLIC_URL || '/media/covers';

// Ensure storage directories exist
export async function initializeStorage(): Promise<void> {
  for (const dir of Object.values(STORAGE_PATHS)) {
    await fs.mkdir(dir, { recursive: true });
  }
  console.log('📁 Storage directories initialized:', STORAGE_BASE_PATH);
}
