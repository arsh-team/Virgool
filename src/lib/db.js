import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MongoDB connection string is missing!");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on("disconnected", () => {
  cached.conn = null;
  cached.promise = null;
});

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
