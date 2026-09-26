import { randomUUID } from 'node:crypto';
import { seedData } from '../data/seed.js';

// Services depend on this boundary. A Mongo implementation should implement
// these methods using sessions/transactions and an atomic Counter increment.
export class MemoryRepository {
  constructor(data = seedData()) { this.data = data; }
  all(collection) { return this.data[collection]; }
  get(collection, id) { return this.all(collection).find(item => item.id === id); }
  insert(collection, values) { const item = { ...values, id: randomUUID() }; this.all(collection).push(item); return item; }
  update(collection, id, values) { const item = this.get(collection, id); if (item) Object.assign(item, values); return item; }
  nextReference(prefix) { const value = (this.data.counters[prefix] ?? 0) + 1; this.data.counters[prefix] = value; return `${prefix}/${String(value).padStart(4, '0')}`; }
  transaction(action) {
    const backup = structuredClone(this.data);
    try { return action(); } catch (error) { this.data = backup; throw error; }
  }
}
export const repository = new MemoryRepository();
