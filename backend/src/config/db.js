import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.warn("⚠️ MONGO_URI not found in env. Falling back to local JSON database.");
    return false;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("🔌 Connected to MongoDB successfully.");
    return true;
  } catch (err) {
    console.warn(`⚠️ MongoDB connection failed (${err.message}). Falling back to local JSON database.`);
    return false;
  }
}
