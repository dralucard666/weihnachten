import { Pool } from 'pg';

/**
 * Check media files in database
 */
async function checkMedia() {
  const connectionString = process.argv[2] || 'postgresql://quizuser:quizpass@localhost:5432/quizdb';
  
  const url = new URL(connectionString);
  const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password || '',
  });
  
  try {
    console.log('🔍 Checking media files...\n');
    
    const result = await pool.query('SELECT COUNT(*) as count FROM media_files');
    const count = parseInt(result.rows[0].count);
    console.log(`📊 Total media files in database: ${count}\n`);
    
    if (count > 0) {
      const sample = await pool.query(`
        SELECT filename, mimetype, size_bytes, original_path 
        FROM media_files 
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      console.log('Latest 10 media files:');
      sample.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.filename} (${row.mimetype}, ${(row.size_bytes / 1024 / 1024).toFixed(2)}MB)`);
        console.log(`     Original: ${row.original_path}`);
      });
      
      // Get type breakdown
      const types = await pool.query(`
        SELECT 
          CASE 
            WHEN mimetype LIKE 'video/%' THEN 'video'
            WHEN mimetype LIKE 'audio/%' THEN 'audio'
            WHEN mimetype LIKE 'image/%' THEN 'image'
            ELSE 'other'
          END as type,
          COUNT(*) as count,
          SUM(size_bytes) as total_bytes
        FROM media_files
        GROUP BY type
        ORDER BY count DESC
      `);
      
      console.log('\n📈 Media type breakdown:');
      types.rows.forEach(row => {
        const sizeMB = (row.total_bytes / 1024 / 1024).toFixed(2);
        console.log(`  - ${row.type}: ${row.count} files (${sizeMB}MB total)`);
      });
    }
    
    await pool.end();
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkMedia();
