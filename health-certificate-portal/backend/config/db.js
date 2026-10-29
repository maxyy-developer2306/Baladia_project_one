// MongoDB connection helper.
// Supports both MongoDB Atlas (MONGO_ATLAS_URI) and a local MongoDB instance.
// Reuses the existing connection across warm serverless invocations.
const mongoose = require('mongoose');

let cachedConnection = null;

async function connectDB() {
  // If a connection already exists and is ready, reuse it.
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If a previous connection attempt is in flight, wait for it.
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', reject);
    });
  }

  const atlasUri = process.env.MONGO_ATLAS_URI;
  const localUri = process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/Baladia';

  // Try Atlas first; fall back to local if Atlas is unreachable.
  const uri = atlasUri && atlasUri.trim().length > 0 ? atlasUri : localUri;

  try {
    cachedConnection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');
    return cachedConnection;
  } catch (error) {
    if (atlasUri && atlasUri.trim().length > 0) {
      console.error('Atlas connection failed, falling back to local:', error.message);
      try {
        cachedConnection = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 15000,
          socketTimeoutMS: 45000,
        });
        console.log('MongoDB connected (local fallback)');
        return cachedConnection;
      } catch (localError) {
        console.error('Local MongoDB connection error:', localError.message);
        throw localError;
      }
    }
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

module.exports = connectDB;