/**
 * Migration script: Download all book files from Firebase Storage to local storage.
 *
 * Usage:
 *   npx tsx src/scripts/migrate-firebase-storage.ts
 *
 * This script:
 * 1. Reads all published books with a fileUrl from the database
 * 2. Downloads each file from Firebase Storage
 * 3. Saves it to the local storage path (/var/www/papers-storage/books/)
 * 4. Reports success/failure for each file
 */

import prisma from '../config/database';
import { firebaseStorage } from '../config/firebase';
import { STORAGE_PATHS } from '../config/storage';
import { initializeStorage } from '../config/storage';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
  console.log('🚀 Starting Firebase → Local Storage migration...\n');

  // Ensure storage directories exist
  await initializeStorage();

  if (!firebaseStorage) {
    console.error('❌ Firebase Storage is not configured. Check your .env file.');
    process.exit(1);
  }

  // Get all books with fileUrl
  const books = await prisma.book.findMany({
    where: {
      fileUrl: { not: null },
    },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      status: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📚 Found ${books.length} books with files to migrate.\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const book of books) {
    const fileUrl = book.fileUrl!;
    const localPath = path.join(STORAGE_PATHS.books, fileUrl);

    // Check if file already exists locally
    try {
      const stat = await fs.stat(localPath);
      if (stat.isFile() && stat.size > 0) {
        console.log(`⏭️  [SKIP] "${book.title}" — already exists (${formatBytes(stat.size)})`);
        skipped++;
        continue;
      }
    } catch {
      // File doesn't exist, proceed with download
    }

    // Try to download from Firebase Storage
    try {
      const file = firebaseStorage.file(fileUrl);

      // Check if file exists in Firebase
      const [exists] = await file.exists();
      if (!exists) {
        console.error(
          `❌ [MISSING] "${book.title}" — file "${fileUrl}" not found in Firebase Storage`,
        );
        failed++;
        continue;
      }

      // Download file
      const [buffer] = await file.download();

      if (buffer.length === 0) {
        console.error(
          `❌ [EMPTY] "${book.title}" — file "${fileUrl}" is empty in Firebase Storage`,
        );
        failed++;
        continue;
      }

      // Save to local storage
      await fs.writeFile(localPath, buffer);

      console.log(`✅ [OK] "${book.title}" — ${fileUrl} (${formatBytes(buffer.length)})`);
      success++;
    } catch (err: any) {
      console.error(`❌ [ERROR] "${book.title}" — ${fileUrl}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Migration complete!`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⏭️  Skipped (already exists): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📚 Total: ${books.length}`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

migrate().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
