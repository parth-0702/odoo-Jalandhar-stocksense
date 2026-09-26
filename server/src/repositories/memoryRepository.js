import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import { seedData } from '../data/seed.js';

// Services depend on this boundary. A Mongo implementation should implement
// these methods using sessions/transactions and an atomic Counter increment.
export class MemoryRepository {
  constructor(data = seedData()) { this.data = data; this.context = new AsyncLocalStorage(); this.tail = Promise.resolve(); }
  current() { return this.context.getStore() || this.data; }
  all(collection) { return this.current()[collection]; }
  get(collection, id) { return this.all(collection).find(item => item.id === id); }
  insert(collection, values) { const item = { ...values, id: randomUUID() }; this.all(collection).push(item); return item; }
  update(collection, id, values) { const item = this.get(collection, id); if (item) Object.assign(item, values); return item; }
  nextReference(prefix) { const value = (this.current().counters[prefix] ?? 0) + 1; this.current().counters[prefix] = value; return `${prefix}/${String(value).padStart(4, '0')}`; }
  deleteWhere(collection, predicate) { this.current()[collection] = this.all(collection).filter(item => !predicate(item)); }
  transaction(action) {
    if (this.context.getStore()) return action();
    const run = this.tail.then(async () => {
      const working = structuredClone(this.data);
      const result = await this.context.run(working, action);
      this.data = working;
      return result;
    });
    this.tail = run.catch(() => undefined);
    return run;
  }
}
export const repository = new MemoryRepository();
