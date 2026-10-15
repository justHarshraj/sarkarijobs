import mongoose from 'mongoose';

/**
 * MongoDB connection singleton.
 * Prevents multiple connections during Next.js hot reload and serverless invocations.
 * Uses a global cache to maintain a single connection across module reloads.
 */

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  // On Vercel or production: fail fast immediately if MONGODB_URI is not configured
  if (!uri && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    const errMsg =
      'MONGODB_URI environment variable is not configured in Vercel settings. Please add MONGODB_URI in Vercel Dashboard -> Settings -> Environment Variables.';
    console.error(`❌ [MongoDB] ${errMsg}`);
    throw new Error(errMsg);
  }

  const connectionUri = uri || 'mongodb://localhost:27017/sarkarijobs';

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 3500, // Fast fail in 3.5s so serverless requests do not stall
      socketTimeoutMS: 30000,
    };

    cached.promise = mongoose
      .connect(connectionUri, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error('❌ MongoDB connection error:', error.message || error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { connectDB };
export default connectDB;

