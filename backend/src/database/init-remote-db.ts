import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to initialize remote database schema
 * Usage: ts-node init-remote-db.ts <connectionString>
 */
async function initRemoteDatabase() {
  const connectionString = process.argv[2];
  
  if (!connectionString) {
    console.error('❌ Usage: ts-node init-remote-db.ts <connectionString>');
    console.error('Example: ts-node init-remote-db.ts "postgresql://user:pass@host:5432/dbname"');
    process.exit(1);
  }

  console.log('🚀 Initializing remote database...\n');
  console.log('Connection:', connectionString.replace(/:[^:@]+@/, ':****@'), '\n');

  const pool = new Pool({ connectionString });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected successfully\n');

    // Read init.sql
    const initSqlPath = path.join(__dirname, 'init.sql');
    if (!fs.existsSync(initSqlPath)) {
      throw new Error('init.sql not found at: ' + initSqlPath);
    }

    const initSql = fs.readFileSync(initSqlPath, 'utf-8');
    console.log('📖 Executing init.sql...\n');

    // Execute the SQL
    await client.query(initSql);
    
    console.log('✅ Database schema initialized successfully!\n');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    client.release();
    await pool.end();
    
    console.log('\n✅ Done! You can now run the migration.');
    
  } catch (err) {
    console.error('❌ Error:', err);
    await pool.end();
    process.exit(1);
  }
}

initRemoteDatabase();
