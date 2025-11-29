import { Pool, PoolConfig } from 'pg';

// Database configuration
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://quizuser:quizpass@localhost:5432/quizdb',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create a connection pool
const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Export the pool for queries
export default pool;

// Helper function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0]);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err);
    return false;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Database pool closed');
}
