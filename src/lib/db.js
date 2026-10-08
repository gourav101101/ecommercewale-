import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongod: null };
}


async function dbConnect() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is required for database-backed features.');
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
