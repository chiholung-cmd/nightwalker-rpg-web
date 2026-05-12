import { MongoClient } from 'mongodb'

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

export function getMongoClient() {
  const uri = process.env.MONGODB_URI

  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    throw new Error('Invalid or missing MONGODB_URI. It must start with mongodb:// or mongodb+srv://')
  }

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }

  return globalWithMongo._mongoClientPromise
}
