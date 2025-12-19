import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  console.log('DB: connectToDatabase called');
  if (!MONGODB_URI) {
    console.error('DB Error: MONGO_URI is not defined');
    throw new Error(
      'Please define the MONGO_URI environment variable inside .env.local'
    );
  } else {
    console.log('DB: MONGO_URI is defined (length: ' + MONGODB_URI.length + ')');
  }

  if (cached.conn) {
    console.log('DB: Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('DB: Creating new connection promise');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('DB: New connection established');
      return mongoose;
    }).catch(err => {
      console.error('DB Connection Promise Error:', err);
      throw err;
    });
  }
  
  try {
    console.log('DB: Awaiting connection promise');
    cached.conn = await cached.promise;
    console.log('DB: Connection ready');
  } catch (e) {
    console.error('DB: Error awaiting connection:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
