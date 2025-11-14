import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'datagen';

export async function connectToDatabase(): Promise<void> {
  if (client && db) {
    return;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Disconnected from MongoDB');
  }
}

export async function getCollection<TDocument>(collectionName: string): Promise<Collection<TDocument>> {
  if (!db) {
    await connectToDatabase();
  }
  if (!db) {
    throw new Error('Database connection failed');
  }
  return db.collection<TDocument>(collectionName);
}

// Helper to get database instance
export async function getDb(): Promise<Db> {
  if (!db) {
    await connectToDatabase();
  }
  if (!db) {
    throw new Error('Database connection failed');
  }
  return db;
}
