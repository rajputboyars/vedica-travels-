import mongoose from 'mongoose'
import { env } from '@/config/env'

// Cache the connection on `global` so hot-reload in dev (and serverless
// invocations sharing a warm container) don't open a new connection per
// request — the standard Mongoose-in-Next.js pattern.
type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
const globalForMongoose = global as unknown as { __mongoose?: MongooseCache }

let cached = globalForMongoose.__mongoose

if (!cached) {
  cached = globalForMongoose.__mongoose = { conn: null, promise: null }
}

export default async function connectDB() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not defined')
  }
  if (cached!.conn) return cached!.conn

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(env.mongodbUri, { bufferCommands: false })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}
