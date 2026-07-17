const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function connectDB() {
  const client = await pool.connect();
  await client.query('SELECT NOW()');
  client.release();
}

function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, connectDB, query };
