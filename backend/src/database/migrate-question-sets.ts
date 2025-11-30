import { Pool } from 'pg';
import { questionService } from './QuestionService';
import { questionSetService } from './QuestionSetService';
import { testConnection } from './db';

/**
 * Migration script to create default question sets
 * Usage: ts-node migrate-question-sets.ts [connectionString]
 */
async function migrateQuestionSets() {
  console.log('📦 Starting question set migration...\n');

  // Check for custom connection string from command line
  const customConnectionString = process.argv[2];
  if (customConnectionString) {
    console.log('🔗 Using custom database connection string\n');
    console.log('Connection:', customConnectionString.replace(/:[^:@]+@/, ':****@'), '\n');
    
    // Parse URL to handle cases with no password
    const url = new URL(customConnectionString);
    const customPool = new Pool({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password || '',
    });
    
    // Override the default pool in db module
    const dbModule = await import('./db');
    (dbModule as any).default = customPool;
    
    // Test custom connection
    try {
      const client = await customPool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ Custom database connection test successful:', result.rows[0]);
      client.release();
    } catch (err) {
      console.error('❌ Custom database connection test failed:', err);
      process.exit(1);
    }
  } else {
    // Test default database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database. Exiting.');
      process.exit(1);
    }
  }

  // Check if any sets already exist
  const existingSets = await questionSetService.getAllQuestionSets(false);
  console.log(`📊 Current question sets: ${existingSets.length}\n`);

  // Create default "All Questions" set
  const defaultSetName = 'all';
  let defaultSetId: string;

  const existingDefault = await questionSetService.getQuestionSetByName(defaultSetName);
  
  if (existingDefault) {
    console.log(`✅ Default set "${defaultSetName}" already exists`);
    defaultSetId = existingDefault.id;
  } else {
    console.log(`📝 Creating default question set: "${defaultSetName}"`);
    defaultSetId = await questionSetService.createQuestionSet(
      defaultSetName,
      'Complete collection of all available questions'
    );
    console.log(`✅ Created set with ID: ${defaultSetId}\n`);
  }

  // Get all questions
  console.log('📖 Fetching all questions from database...');
  const allQuestions = await questionService.getAllQuestions();
  console.log(`✅ Found ${allQuestions.length} questions\n`);

  if (allQuestions.length === 0) {
    console.log('⚠️  No questions found in database. Run question migration first.');
    process.exit(0);
  }

  // Add all questions to the default set
  console.log(`📥 Adding questions to "${defaultSetName}" set...`);
  const questionIds = allQuestions.map(q => q.id);
  const addedCount = await questionSetService.addQuestionsToSet(defaultSetId, questionIds);
  
  console.log(`✅ Added ${addedCount} questions (${allQuestions.length - addedCount} already existed)\n`);

  // Create additional example sets (optional)
  const exampleSets = [
    {
      name: 'christmas',
      description: 'Christmas-themed quiz questions',
      questionCount: 0 // Will be populated manually by users
    }
  ];

  for (const setInfo of exampleSets) {
    const existing = await questionSetService.getQuestionSetByName(setInfo.name);
    if (!existing) {
      const setId = await questionSetService.createQuestionSet(setInfo.name, setInfo.description);
      console.log(`✅ Created example set: "${setInfo.name}" (${setId})`);
    } else {
      console.log(`⏭️  Set "${setInfo.name}" already exists`);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Question set migration complete!');
  
  const finalSets = await questionSetService.getAllQuestionSets(true);
  console.log('\n📊 Question Sets:');
  for (const set of finalSets) {
    console.log(`   - ${set.name}: ${set.questionCount} questions`);
  }
  
  console.log('═'.repeat(60));
  process.exit(0);
}

// Run migration
migrateQuestionSets().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
