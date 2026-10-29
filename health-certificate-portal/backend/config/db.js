// MongoDB connection helper (serverless-safe).
// Atlas (MONGO_ATLAS_URI) use hota hai. Local fallback sirf development me.
const mongoose = require('mongoose');

const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// Global cache: warm serverless invocations me connection reuse hota hai.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const options = {
  serverSelectionTimeoutMS: 8000, // Vercel ke timeout se pehle fail ho jaye
  socketTimeoutMS: 45000,
  maxPoolSize: 5,
};

async function connectDB() {
  // Already connected? reuse.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const atlasUri = (process.env.MONGO_ATLAS_URI || '').trim();
    const localUri =
      process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/Baladia';

    cached.promise = (async () => {
      // Production: sirf Atlas, koi local fallback nahi.
      if (isProd) {
        if (!atlasUri) {
          throw new Error('MONGO_ATLAS_URI is not set in environment variables');
        }
        const conn = await mongoose.connect(atlasUri, options);
        console.log('MongoDB connected (Atlas)');
        return conn;
      }

      // Development: pehle Atlas, phir local.
      if (atlasUri) {
        try {
          const conn = await mongoose.connect(atlasUri, options);
          console.log('MongoDB connected (Atlas)');
          return conn;
        } catch (error) {
          console.error('Atlas failed, falling back to local:', error.message);
        }
      }
      const conn = await mongoose.connect(localUri, options);
      console.log('MongoDB connected (local)');
      return conn;
    })().catch((error) => {
      cached.promise = null; // agli request pe dobara try ho
      cached.conn = null;
      console.error('MongoDB connection error:', error.message);
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;