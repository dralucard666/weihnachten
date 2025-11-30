import { Pool } from 'pg';

/**
 * Script to check database contents
 * Usage: ts-node check-db.ts [connectionString]
 */
async function checkDatabase() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL || 'postgresql://quizuser:quizpass@localhost:5432/quizdb';
  
  console.log('🔍 Checking database...\n');
  console.log('Connection:', connectionString.replace(/:[^:@]+@/, ':****@'), '\n');

  // Parse URL to handle cases with no password
  const url = new URL(connectionString);
  const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1), // Remove leading /
    user: url.username,
    password: url.password || '', // Empty password if not provided
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected successfully\n');
    
    // Check questions table
    const countResult = await client.query('SELECT COUNT(*) FROM questions');
    const count = parseInt(countResult.rows[0].count);
    console.log(`📊 Total questions: ${count}\n`);

    if (count > 0) {
      // Get question type distribution
      const typesResult = await client.query(`
        SELECT type, COUNT(*) as count 
        FROM questions 
        GROUP BY type 
        ORDER BY count DESC
      `);
      
      console.log('Question types:');
      typesResult.rows.forEach(row => {
        console.log(`  - ${row.type}: ${row.count}`);
      });
      console.log();

      // Show first 5 questions
      const questionsResult = await client.query(`
        SELECT id, type, text_de, text_en 
        FROM questions 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      console.log('Latest 5 questions:');
      questionsResult.rows.forEach((q, i) => {
        const preview = q.text_de.substring(0, 60);
        console.log(`  ${i + 1}. [${q.type}] ${preview}${q.text_de.length > 60 ? '...' : ''}`);
      });
    }

    // Check media table
    const mediaResult = await client.query('SELECT COUNT(*) FROM media');
    const mediaCount = parseInt(mediaResult.rows[0].count);
    console.log(`\n📁 Total media files: ${mediaCount}`);

    client.release();
    await pool.end();
    
  } catch (err) {
    console.error('❌ Error:', err);
    await pool.end();
    process.exit(1);
  }
}

checkDatabase();
