require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { connectKafka } = require('./config/kafka');

const PORT = process.env.PORT || 3002;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas');

    await connectKafka();
    console.log('✓ Connected to Upstash Kafka');

    app.listen(PORT, () => {
      console.log(`✓ Dispatch service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
