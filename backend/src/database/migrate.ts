import * as fs from 'fs';
import * as path from 'path';
import { questionService } from './QuestionService';
import { mediaService } from './MediaService';
import { testConnection } from './db';
import { QuestionType, QuestionMedia, MediaConfig } from '../../../shared/types';

interface JsonQuestion {
  text: string | { de: string; en: string };
  type: QuestionType;
  answers?: Array<{ id: string; text: string | { de: string; en: string }; sound?: string[] }>;
  correctAnswerId?: string;
  correctAnswer?: string | { de: string; en: string };
  correctAnswers?: string[];
  orderItems?: Array<{ id: string; text: string | { de: string; en: string }; sound?: string[] }>;
  correctOrder?: string[];
  media?: QuestionMedia;
}

/**
 * Migration script to import questions from JSON files to PostgreSQL
 */
async function migrateQuestions() {
  console.log('🚀 Starting question migration...\n');

  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to database. Exiting.');
    process.exit(1);
  }

  // Check current question count
  const currentCount = await questionService.getQuestionCount();
  console.log(`📊 Current questions in database: ${currentCount}\n`);

  if (currentCount > 0) {
    console.log('⚠️  Database already contains questions.');
    console.log('⚠️  This script will ADD new questions, not replace existing ones.');
    console.log('⚠️  To start fresh, truncate the questions table first.\n');
  }

  // Read JSON files
  const dataDir = path.join(__dirname, '../data');
  const questionsPath = path.join(dataDir, 'questions.json');

  if (!fs.existsSync(questionsPath)) {
    console.error('❌ questions.json not found in', dataDir);
    process.exit(1);
  }

  console.log('📖 Reading JSON file...');
  const questions: JsonQuestion[] = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  console.log(`✅ Found ${questions.length} questions in JSON file\n`);

  // Migrate each question
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    try {
      const textDe = typeof q.text === 'string' ? q.text : q.text.de;
      const textPreview = textDe.substring(0, 50);
      console.log(`[${i + 1}/${questions.length}] Migrating: ${textPreview}...`);

      switch (q.type) {
        case 'multiple-choice':
          await migrateMultipleChoice(q);
          break;
        case 'custom-answers':
          await migrateCustomAnswers(q);
          break;
        case 'text-input':
          await migrateTextInput(q);
          break;
        case 'order':
          await migrateOrder(q);
          break;
        default:
          console.warn(`⚠️  Unknown question type: ${q.type}`);
          errorCount++;
          continue;
      }

      successCount++;
      console.log(`   ✅ Success\n`);
    } catch (err) {
      errorCount++;
      console.error(`   ❌ Error:`, err);
      console.log();
    }
  }

  console.log('═'.repeat(60));
  console.log(`✅ Migration complete!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
  console.log(`   Total: ${questions.length}`);
  console.log('═'.repeat(60));

  process.exit(0);
}

/**
 * Upload media files to database and convert paths to UUIDs
 */
async function processMedia(media: QuestionMedia | undefined): Promise<QuestionMedia | undefined> {
  if (!media) return undefined;

  const dataDir = path.join(__dirname, '../data');
  const processedMedia: QuestionMedia = {};

  // Process beforeQuestion media
  if (media.beforeQuestion) {
    processedMedia.beforeQuestion = await processMediaConfig(media.beforeQuestion, dataDir);
  }

  // Process beforeAnswer media
  if (media.beforeAnswer) {
    processedMedia.beforeAnswer = await processMediaConfig(media.beforeAnswer, dataDir);
  }

  return processedMedia;
}

/**
 * Process a single MediaConfig, uploading files and replacing paths with UUIDs
 */
async function processMediaConfig(config: MediaConfig, dataDir: string): Promise<MediaConfig> {
  const newSources: string[] = [];

  for (const source of config.sources) {
    // Source is like "australien/australien.mp4"
    const filePath = path.join(dataDir, source);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠️  Media file not found: ${source}, skipping`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(source);
    
    // Determine MIME type based on extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    const mimetype = mimeTypes[ext] || 'application/octet-stream';

    // Upload to database
    const mediaId = await mediaService.uploadMedia(filename, fileBuffer, mimetype, source);
    console.log(`   📁 Uploaded ${source} → ${mediaId}`);
    
    // Store UUID instead of path
    newSources.push(mediaId);
  }

  return {
    ...config,
    sources: newSources,
  };
}

/**
 * Process sound files and return UUIDs
 */
async function processSounds(sounds: string[] | undefined, dataDir: string): Promise<string[] | undefined> {
  if (!sounds || sounds.length === 0) return undefined;

  const newSounds: string[] = [];

  for (const sound of sounds) {
    const filePath = path.join(dataDir, sound);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠️  Sound file not found: ${sound}, skipping`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(sound);
    
    // Determine MIME type
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
    };
    const mimetype = mimeTypes[ext] || 'application/octet-stream';

    // Upload to database
    const mediaId = await mediaService.uploadMedia(filename, fileBuffer, mimetype, sound);
    console.log(`   🔊 Uploaded sound ${sound} → ${mediaId}`);
    
    // Store UUID instead of path
    newSounds.push(mediaId);
  }

  return newSounds.length > 0 ? newSounds : undefined;
}

async function migrateMultipleChoice(q: JsonQuestion): Promise<void> {
  if (!q.answers) {
    throw new Error('Missing answers for multiple-choice question');
  }

  const textDe = typeof q.text === 'string' ? q.text : q.text.de;
  const textEn = typeof q.text === 'string' ? q.text : q.text.en;
  const dataDir = path.join(__dirname, '../data');

  const answers = await Promise.all(q.answers.map(async (answer) => {
    const answerTextDe = typeof answer.text === 'string' ? answer.text : answer.text.de;
    const answerTextEn = typeof answer.text === 'string' ? answer.text : answer.text.en;
    
    return {
      textDe: answerTextDe,
      textEn: answerTextEn,
      isCorrect: answer.id === q.correctAnswerId,
      sounds: await processSounds(answer.sound, dataDir),
    };
  }));

  const processedMedia = await processMedia(q.media);

  await questionService.createQuestion(
    'multiple-choice',
    textDe,
    textEn,
    {
      answers,
      media: processedMedia,
    }
  );
}

async function migrateCustomAnswers(q: JsonQuestion): Promise<void> {
  if (!q.correctAnswer) {
    throw new Error('Missing correct answer for custom-answers question');
  }

  const textDe = typeof q.text === 'string' ? q.text : q.text.de;
  const textEn = typeof q.text === 'string' ? q.text : q.text.en;
  const correctAnswerDe = typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.de;
  const correctAnswerEn = typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.en;

  const processedMedia = await processMedia(q.media);

  await questionService.createQuestion(
    'custom-answers',
    textDe,
    textEn,
    {
      correctAnswerDe,
      correctAnswerEn,
      media: processedMedia,
    }
  );
}

async function migrateTextInput(q: JsonQuestion): Promise<void> {
  // For text-input, use the first correct answer as the main answer, or empty string if only array exists
  const correctAnswerDe = q.correctAnswer 
    ? (typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.de)
    : (q.correctAnswers && q.correctAnswers.length > 0 ? q.correctAnswers[0] : '');
  
  const correctAnswerEn = q.correctAnswer 
    ? (typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.en)
    : (q.correctAnswers && q.correctAnswers.length > 0 ? q.correctAnswers[0] : '');

  if (!correctAnswerDe || !correctAnswerEn) {
    throw new Error('Missing correct answer for text-input question');
  }

  const textDe = typeof q.text === 'string' ? q.text : q.text.de;
  const textEn = typeof q.text === 'string' ? q.text : q.text.en;

  const processedMedia = await processMedia(q.media);

  await questionService.createQuestion(
    'text-input',
    textDe,
    textEn,
    {
      correctAnswerDe,
      correctAnswerEn,
      correctAnswers: q.correctAnswers || [],
      media: processedMedia,
    }
  );
}

async function migrateOrder(q: JsonQuestion): Promise<void> {
  if (!q.orderItems) {
    throw new Error('Missing order items for order question');
  }

  const textDe = typeof q.text === 'string' ? q.text : q.text.de;
  const textEn = typeof q.text === 'string' ? q.text : q.text.en;
  const dataDir = path.join(__dirname, '../data');

  // Map the correct order to maintain the sequence
  const orderItems = await Promise.all(q.correctOrder!.map(async (correctId) => {
    const item = q.orderItems!.find(item => item.id === correctId);
    
    if (!item) {
      throw new Error(`Order item ${correctId} not found`);
    }

    const itemTextDe = typeof item.text === 'string' ? item.text : item.text.de;
    const itemTextEn = typeof item.text === 'string' ? item.text : item.text.en;

    return {
      textDe: itemTextDe,
      textEn: itemTextEn,
      sounds: await processSounds(item.sound, dataDir),
    };
  }));

  const processedMedia = await processMedia(q.media);

  await questionService.createQuestion(
    'order',
    textDe,
    textEn,
    {
      orderItems,
      media: processedMedia,
    }
  );
}

// Run migration
migrateQuestions().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
