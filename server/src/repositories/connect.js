import mongoose from 'mongoose';
import { seedData } from '../data/seed.js';
import { loadCache, MongoRepository } from './mongoRepository.js';

export async function createConnectedRepository(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const repo = new MongoRepository(await loadCache());
  if (!repo.cache.users.length) {
    repo.cache = seedData();
    await repo.flush(undefined, { includeCounters: true });
  }
  return repo;
}
