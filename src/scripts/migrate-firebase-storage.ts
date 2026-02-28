/**
 * Migration script: Download all book files from Firebase Storage to local storage.
 *
 * Usage:
 *   npx tsx src/scripts/migrate-firebase-storage.ts
 *   npx tsx src/scripts/migrate-firebase-storage.ts --list-only   (just list Firebase files)
 *
 * This script:
 * 1. Lists all files in Firebase Storage to understand the structure
 * 2. Reads all books with a fileUrl from the database
 * 3. Matches each fileUrl to a Firebase file (trying multiple path patterns)
 * 4. Downloads and saves to local storage
 */

import prisma from '../config/database';
import { firebaseStorage } from '../config/firebase';
import { STORAGE_PATHS } from '../config/storage';
import { initializeStorage } from '../config/storage';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
  const listOnly = process.argv.includes('--list-only');

  console.log('🚀 Starting Firebase → Local Storage migration...\n');

  await initializeStorage();

  if (!firebaseStorage) {
    console.error('❌ Firebase Storage is not configured. Check your .env file.');
    process.exit(1);
  }

  // Step 1: List all files in Firebase Storage
  console.log('📂 Listing all files in Firebase Storage...');
  const [files] = await firebaseStorage.getFiles();
  const firebaseFiles = new Map<string, string>();

  for (const file of files) {
    firebaseFiles.set(file.name, file.name);
    // Also index by basename for fuzzy matching
    const basename = path.basename(file.name);
    if (!firebaseFiles.has(basename)) {
      firebaseFiles.set(basename, file.name);
    }
  }

  console.log(`   Found ${files.length} files in Firebase Storage.`);

  if (listOnly) {
    console.log('\n📋 Firebase Storage file listing:');
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      console.log(`   ${file.name} (${formatBytes(Number(metadata.size || 0))})`);
    }
    await prisma.$disconnect();
    return;
  }

  // Show some example files for debugging
  console.log('   Sample files:');
  for (const file of files.slice(0, 10)) {
    console.log(`     - ${file.name}`);
  }
  if (files.length > 10) {
    console.log(`     ... and ${files.length - 10} more\n`);
  }

  // Step 2: Get all books from DB
  const books = await prisma.book.findMany({
    where: { fileUrl: { not: null } },
    select: { id: true, title: true, fileUrl: true, status: true },
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
      // File doesn't exist, proceed
    }

    // Try to find the file in Firebase using multiple path patterns
    const firebasePath = findFirebasePath(fileUrl, firebaseFiles);

    if (!firebasePath) {
      console.error(
        `❌ [MISSING] "${book.title}" — "${fileUrl}" not found in Firebase (tried multiple patterns)`,
      );
      failed++;
      continue;
    }

    try {
      const file = firebaseStorage.file(firebasePath);
      const [buffer] = await file.download();

      if (buffer.length === 0) {
        console.error(`❌ [EMPTY] "${book.title}" — "${firebasePath}" is empty`);
        failed++;
        continue;
      }

      await fs.writeFile(localPath, buffer);
      console.log(
        `✅ [OK] "${book.title}" — ${firebasePath} → ${fileUrl} (${formatBytes(buffer.length)})`,
      );
      success++;
    } catch (err: any) {
      console.error(`❌ [ERROR] "${book.title}" — ${firebasePath}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration complete!');
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⏭️  Skipped (already exists): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📚 Total: ${books.length}`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

/**
 * Try to find the correct Firebase Storage path for a given fileUrl.
 * The DB stores names like "books_UUID_document.pdf" or "pdfs_NAME.pdf"
 * which may correspond to different Firebase paths.
 */
function findFirebasePath(fileUrl: string, firebaseFiles: Map<string, string>): string | null {
  // Try 1: Exact match (fileUrl as-is)
  if (firebaseFiles.has(fileUrl)) {
    return firebaseFiles.get(fileUrl)!;
  }

  // Try 2: Replace first underscore with "/" (books_UUID... → books/UUID...)
  const withSlash = fileUrl.replace('_', '/');
  if (firebaseFiles.has(withSlash)) {
    return firebaseFiles.get(withSlash)!;
  }

  // Try 3: Replace all underscores with "/"
  const allSlashes = fileUrl.replace(/_/g, '/');
  if (firebaseFiles.has(allSlashes)) {
    return firebaseFiles.get(allSlashes)!;
  }

  // Try 4: Just the basename
  const basename = path.basename(fileUrl);
  if (firebaseFiles.has(basename)) {
    return firebaseFiles.get(basename)!;
  }

  // Try 5: For "books_UUID_document.pdf", try "books/UUID/document.pdf"
  const parts = fileUrl.split('_');
  if (parts.length >= 3 && (parts[0] === 'books' || parts[0] === 'pdfs')) {
    const folder = parts[0];
    const rest = parts.slice(1).join('_');
    const withFolder = `${folder}/${rest}`;
    if (firebaseFiles.has(withFolder)) {
      return firebaseFiles.get(withFolder)!;
    }

    // Try: folder/UUID/filename.pdf where UUID is parts[1] through parts[5]
    // (UUID has 5 parts separated by -)
    // books_fe698bc6-3b09-43ab-98f5-f69f70cdbc37_document.pdf
    // → books/fe698bc6-3b09-43ab-98f5-f69f70cdbc37_document.pdf
    // → books/fe698bc6-3b09-43ab-98f5-f69f70cdbc37/document.pdf
    const uuidAndFile = rest;
    const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_(.+)$/;
    const match = uuidAndFile.match(uuidPattern);
    if (match) {
      const uuid = match[1];
      const filename = match[2];

      // Try: folder/UUID/filename
      const nested = `${folder}/${uuid}/${filename}`;
      if (firebaseFiles.has(nested)) {
        return firebaseFiles.get(nested)!;
      }

      // Try: folder/UUID_filename
      const flat = `${folder}/${uuid}_${filename}`;
      if (firebaseFiles.has(flat)) {
        return firebaseFiles.get(flat)!;
      }
    }
  }

  return null;
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
