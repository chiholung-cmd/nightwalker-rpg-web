import { MongoClient } from 'mongodb'

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

/**
 * Cache successful connections between warm Vercel invocations.
 * A rejected Atlas connection MUST be evicted so that temporary DNS,
 * networking, or cluster wake-up failures can recover on the next request.
 */
export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    throw new Error('Invalid or missing MONGODB_URI. It must start with mongodb:// or mongodb+srv://')
  }
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 7000
    })
    const promise = client.connect().catch(async (error: unknown) => {
      if (globalWithMongo._mongoClientPromise === promise) {
        globalWithMongo._mongoClientPromise = undefined
      }
      try { await client.close() } catch {}
      throw error
    })
    globalWithMongo._mongoClientPromise = promise
  }
  return globalWithMongo._mongoClientPromise
}
