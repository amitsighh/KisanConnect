const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kisanconnect';
  
  try {
    // Attempt connecting to specified or local MongoDB with 2s timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
  } catch (err) {
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Starting MongoMemoryServer...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB at ${inMemoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start In-Memory MongoDB:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
