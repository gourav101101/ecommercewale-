import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongod: null };
}

async function connectMemory(opts) {
  console.log('Starting In-Memory MongoDB Server...');
  if (!cached.mongod) {
    cached.mongod = await MongoMemoryServer.create();
  }
  const uri = cached.mongod.getUri();
  return mongoose.connect(uri, opts).then((mongooseInstance) => {
    console.log('Successfully connected to In-Memory MongoDB');
    return mongooseInstance;
  });
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    if (MONGODB_URI === 'memory') {
      cached.promise = connectMemory(opts);
    } else {
      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongooseInstance) => {
          console.log('Successfully connected to MongoDB Atlas');
          return mongooseInstance;
        })
        .catch(async (err) => {
          console.warn('⚠️ Atlas connection failed (IP whitelisting or network issue):', err.message);
          console.warn('⚠️ Automatically falling back to local In-Memory MongoDB...');
          return connectMemory(opts);
        });
    }
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
