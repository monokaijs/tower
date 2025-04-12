import mongoose from "mongoose";
declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; 

async function dbConnect(retryCount = 0) {
  const MONGO_URI = process.env.MONGO_URI!;

  if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in environment variables");
    return;
  }

  console.log("Connecting to MongoDB");
  if (cached.conn) {
    console.log("Using cached connection to MongoDB");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return dbConnect(retryCount + 1);
    }
    
    throw e;
  }
}

export default dbConnect;
