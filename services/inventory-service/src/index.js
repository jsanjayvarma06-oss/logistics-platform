require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const { connectKafka } = require('./config/kafka');
const { runMigrations } = require('./config/migrate');

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await connectDB();
    console.log('✓ Connected to Neon PostgreSQL');

    await runMigrations();
    console.log('✓ Migrations complete');

    await connectKafka();
    console.log('✓ Connected to Upstash Kafka');

    app.listen(PORT, () => {
      console.log(`✓ Inventory service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
