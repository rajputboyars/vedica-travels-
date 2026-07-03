import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then(m => m)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
