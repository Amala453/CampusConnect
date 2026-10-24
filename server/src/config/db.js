require('dotenv').config();
const mongoose = require('mongoose');

let isConnected = false;

/**
 * Clean and resolve the MongoDB connection URI from environment variables
 */
const getMongoUri = () => {
  const raw =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/campusconnect';

  return raw.trim().replace(/^["']|["']$/g, '');
};

/**
 * Connect to MongoDB with robust timeout, retry logic, and connection monitoring
 */
const connectDB = async (retries = 3, delayMs = 3000) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = getMongoUri();
  const timeoutMs = parseInt(process.env.MONGODB_TIMEOUT_MS, 10) || 30000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[MongoDB] Connection attempt ${attempt}/${retries}...`);

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: timeoutMs,
        socketTimeoutMS: 45000,
        connectTimeoutMS: timeoutMs,
      });

      isConnected = conn.connections[0].readyState === 1;
      console.log(
        `[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`
      );

      return conn;
    } catch (error) {
      console.error(
        `[MongoDB Connection Error] Attempt ${attempt}/${retries} failed: ${error.message}`
      );

      if (attempt < retries) {
        console.log(`[MongoDB] Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(
          '[MongoDB] All connection attempts exhausted. Database queries will fail until MongoDB is accessible.'
        );
        throw error;
      }
    }
  }
};

// Monitor connection lifecycle
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Disconnected from database.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB] Reconnected to database.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Runtime Error] ${err.message}`);
});

module.exports = connectDB;
