import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
});

afterEach(async () => {
  const db = mongoose.connection.db;
  if (!db) {
    return;
  }

  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});
