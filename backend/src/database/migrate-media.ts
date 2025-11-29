import * as fs from 'fs';
import * as path from 'path';
import { mediaService } from './MediaService';
import { testConnection } from './db';
import { QuestionMedia } from '../../../shared/types';

// MIME type mapping
const MIME_TYPES: { [key: string]: string } = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
};

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Migration script to import all media files from disk to PostgreSQL
 */
async function migrateMedia() {
  console.log('🎬 Starting media migration...\n');

  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to database. Exiting.');
    process.exit(1);
  }

  // Check current media count
  const currentCount = await mediaService.getMediaCount();
  const currentSize = await mediaService.getTotalMediaSize();
  console.log(`📊 Current media in database: ${currentCount} files`);
  console.log(`💾 Current database size: ${(currentSize / (1024 * 1024)).toFixed(2)} MB\n`);

  if (currentCount > 0) {
    console.log('⚠️  Database already contains media files.');
    console.log('⚠️  This script will ADD new files, not replace existing ones.\n');
  }

  // Read all media files from data directory
  const dataDir = path.join(__dirname, '../data');
  const questionsPath = path.join(dataDir, 'questions.json');

  if (!fs.existsSync(questionsPath)) {
    console.error('❌ questions.json not found');
    process.exit(1);
  }

  // Parse questions to find all media references
  console.log('📖 Reading questions.json to find media references...');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  const mediaPaths = new Set<string>();

  // Extract all media paths from questions
  for (const question of questions) {
    const media = question.media as QuestionMedia | undefined;
    if (media) {
      if (media.beforeQuestion?.sources) {
        media.beforeQuestion.sources.forEach(src => mediaPaths.add(src));
      }
      if (media.beforeAnswer?.sources) {
        media.beforeAnswer.sources.forEach(src => mediaPaths.add(src));
      }
    }
  }

  console.log(`✅ Found ${mediaPaths.size} unique media references\n`);

  // Migrate each media file
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  let totalBytes = 0;

  for (const mediaPath of Array.from(mediaPaths)) {
    try {
      // Check if already exists
      const exists = await mediaService.mediaExists(mediaPath);
      if (exists) {
        console.log(`⏭️  [${successCount + skipCount + errorCount + 1}/${mediaPaths.size}] Skipping (already exists): ${mediaPath}`);
        skipCount++;
        continue;
      }

      const fullPath = path.join(dataDir, mediaPath);
      
      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  [${successCount + skipCount + errorCount + 1}/${mediaPaths.size}] File not found: ${mediaPath}`);
        errorCount++;
        continue;
      }

      console.log(`📥 [${successCount + skipCount + errorCount + 1}/${mediaPaths.size}] Importing: ${mediaPath}`);

      // Read file
      const data = fs.readFileSync(fullPath);
      const filename = path.basename(mediaPath);
      const mimetype = getMimeType(filename);

      // Upload to database
      const mediaId = await mediaService.uploadMedia(filename, data, mimetype, mediaPath);

      totalBytes += data.length;
      successCount++;
      console.log(`   ✅ Success (${mediaId}) - ${(data.length / 1024).toFixed(2)} KB\n`);

    } catch (err) {
      errorCount++;
      console.error(`   ❌ Error:`, err);
      console.log();
    }
  }

  console.log('═'.repeat(60));
  console.log(`✅ Media migration complete!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Skipped (already exists): ${skipCount}`);
  console.log(`   Failed: ${errorCount}`);
  console.log(`   Total: ${mediaPaths.size}`);
  console.log(`   Imported size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
  
  const finalSize = await mediaService.getTotalMediaSize();
  console.log(`   Database size: ${(finalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log('═'.repeat(60));

  process.exit(0);
}

// Run migration
migrateMedia().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
