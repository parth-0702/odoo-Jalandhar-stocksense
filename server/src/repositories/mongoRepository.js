import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import StockQuantity from '../models/StockQuantity.js';
import Document from '../models/Document.js';
import Ledger from '../models/Ledger.js';
import Counter from '../models/Counter.js';
import Session from '../models/Session.js';
import PasswordReset from '../models/PasswordReset.js';

const COLLECTIONS = [
  ['users', User],
  ['sessions', Session],
  ['resets', PasswordReset],
  ['products', Product],
  ['warehouses', Warehouse],
  ['locations', Location],
  ['stock', StockQuantity],
  ['documents', Document],
  ['ledger', Ledger],
];

function plain(value) {
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === 'object') {
    if (typeof value.toHexString === 'function') return value.toHexString();
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      if (key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') continue;
      out[key] = plain(child);
    }
    return out;
  }
  return value;
}

export async function loadCache(session = null) {
  const [users, sessions, resets, products, warehouses, locations, stock, documents, ledger, counters] = await Promise.all([
    User.find().select('+passwordHash').session(session).lean(),
    Session.find().session(session).lean(),
    PasswordReset.find().session(session).lean(),
    Product.find().session(session).lean(),
    Warehouse.find().session(session).lean(),
    Location.find().session(session).lean(),
    StockQuantity.find().session(session).lean(),
    Document.find().session(session).lean(),
    Ledger.find().session(session).lean(),
    Counter.find().session(session).lean(),
  ]);
  return {
    users: users.map(plain), sessions: sessions.map(plain), resets: resets.map(plain), products: products.map(plain),
    warehouses: warehouses.map(plain), locations: locations.map(plain), stock: stock.map(plain), documents: documents.map(plain),
    ledger: ledger.map(plain), counters: Object.fromEntries(counters.map(c => [c.prefix, c.sequence])),
  };
}

export class MongoRepository {
  constructor(cache) { this.cache = cache; this.context = new AsyncLocalStorage(); this.tail = Promise.resolve(); }
  enqueue(fn) {
    const run = this.tail.then(fn, fn);
    this.tail = run.then(() => undefined, () => undefined);
    return run;
  }
  current() { return this.context.getStore()?.data || this.cache; }
  all(collection) { return this.current()[collection]; }
  get(collection, id) { return this.all(collection).find(item => item.id === id); }
  insert(collection, values) {
    if (!this.context.getStore()) return this.transaction(() => this.insert(collection, values));
    const item = { ...values, id: randomUUID() };
    this.all(collection).push(item);
    return item;
  }
  update(collection, id, values) {
    if (!this.context.getStore()) return this.transaction(() => this.update(collection, id, values));
    const item = this.get(collection, id);
    if (item) Object.assign(item, values);
    return item;
  }
  deleteWhere(collection, predicate) {
    if (!this.context.getStore()) return this.transaction(() => this.deleteWhere(collection, predicate));
    this.current()[collection] = this.all(collection).filter(item => !predicate(item));
  }
  async nextReference(prefix) {
    if (!this.context.getStore()) return this.transaction(() => this.nextReference(prefix));
    const { session } = this.context.getStore();
    const counter = await Counter.findOneAndUpdate({ prefix }, { $inc: { sequence: 1 } }, { new: true, upsert: true, session, setDefaultsOnInsert: true });
    this.current().counters[prefix] = counter.sequence;
    return `${prefix}/${String(counter.sequence).padStart(4, '0')}`;
  }
  async flush(session, { includeCounters = false, baseline = {} } = {}) {
    const options = session ? { session } : {};
    for (const [key, Model] of COLLECTIONS) {
      const before = new Map((baseline[key] || []).map(row => [row.id, row]));
      const rows = this.current()[key] || [];
      const remaining = new Set(rows.map(row => row.id));
      const writes = rows.filter(row => JSON.stringify(row) !== JSON.stringify(before.get(row.id))).map(row => ({ replaceOne: { filter: { id: row.id }, replacement: structuredClone(row), upsert: true } }));
      for (const id of before.keys()) if (!remaining.has(id)) writes.push({ deleteOne: { filter: { id } } });
      if (writes.length) await Model.bulkWrite(writes, options);
    }
    if (!includeCounters) return;
    const counters = Object.entries(this.current().counters || {}).map(([prefix, sequence]) => ({ updateOne: { filter: { prefix }, update: { $max: { sequence } }, upsert: true } }));
    if (counters.length) await Counter.bulkWrite(counters, options);
  }
  transaction(action) {
    if (this.context.getStore()) return action();
    return this.enqueue(async () => {
      const session = await mongoose.startSession();
      try {
        let committed;
        const result = await session.withTransaction(async () => {
          const baseline = await loadCache(session);
          const data = structuredClone(baseline);
          return this.context.run({ data, session }, async () => {
            const value = await action();
            await this.flush(session, { baseline });
            committed = data;
            return value;
          });
        });
        this.cache = committed;
        return result;
      } finally {
        await session.endSession();
      }
    });
  }
}
