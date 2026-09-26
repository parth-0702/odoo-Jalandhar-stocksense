import { randomUUID } from 'node:crypto';
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

export async function loadCache() {
  const [users, sessions, resets, products, warehouses, locations, stock, documents, ledger, counters] = await Promise.all([
    User.find().select('+passwordHash').lean(),
    Session.find().lean(),
    PasswordReset.find().lean(),
    Product.find().lean(),
    Warehouse.find().lean(),
    Location.find().lean(),
    StockQuantity.find().lean(),
    Document.find().lean(),
    Ledger.find().lean(),
    Counter.find().lean(),
  ]);
  return {
    users: users.map(plain), sessions: sessions.map(plain), resets: resets.map(plain), products: products.map(plain),
    warehouses: warehouses.map(plain), locations: locations.map(plain), stock: stock.map(plain), documents: documents.map(plain),
    ledger: ledger.map(plain), counters: Object.fromEntries(counters.map(c => [c.prefix, c.sequence])),
  };
}

export class MongoRepository {
  constructor(cache) { this.cache = cache; this.depth = 0; this.session = null; this.tail = Promise.resolve(); }
  enqueue(fn) {
    const run = this.tail.then(fn, fn);
    this.tail = run.then(() => undefined, () => undefined);
    return run;
  }
  all(collection) { return this.cache[collection]; }
  get(collection, id) { return this.all(collection).find(item => item.id === id); }
  insert(collection, values) {
    const item = { ...values, id: randomUUID() };
    this.all(collection).push(item);
    return this.depth ? item : this.enqueue(async () => { await this.flush(); return item; });
  }
  update(collection, id, values) {
    const item = this.get(collection, id);
    if (item) Object.assign(item, values);
    return this.depth || !item ? item : this.enqueue(async () => { await this.flush(); return item; });
  }
  deleteWhere(collection, predicate) {
    this.cache[collection] = this.all(collection).filter(item => !predicate(item));
    if (this.depth === 0) return this.enqueue(async () => { await this.flush(); });
  }
  async nextReference(prefix) {
    if (this.session) {
      const counter = await Counter.findOneAndUpdate({ prefix }, { $inc: { sequence: 1 } }, { new: true, upsert: true, session: this.session, setDefaultsOnInsert: true });
      this.cache.counters[prefix] = counter.sequence;
      return `${prefix}/${String(counter.sequence).padStart(4, '0')}`;
    }
    const value = (this.cache.counters[prefix] ?? 0) + 1;
    this.cache.counters[prefix] = value;
    const reference = `${prefix}/${String(value).padStart(4, '0')}`;
    if (this.depth === 0) await this.enqueue(() => this.flush(null, { includeCounters: true }));
    return reference;
  }
  async flush(session, { includeCounters = false } = {}) {
    const options = session ? { session } : {};
    for (const [key, Model] of COLLECTIONS) {
      await Model.deleteMany({}, options);
      if (this.cache[key]?.length) await Model.insertMany(structuredClone(this.cache[key]), options);
    }
    if (!includeCounters) return;
    await Counter.deleteMany({}, options);
    const counters = Object.entries(this.cache.counters || {}).map(([prefix, sequence]) => ({ prefix, sequence }));
    if (counters.length) await Counter.insertMany(counters, options);
  }
  transaction(action) {
    if (this.depth > 0) return action();
    return this.enqueue(async () => {
      const backup = structuredClone(this.cache);
      const session = await mongoose.startSession();
      this.session = session;
      this.depth++;
      try {
        session.startTransaction();
        const result = await action();
        await this.flush(session);
        await session.commitTransaction();
        return result;
      } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        this.cache = backup;
        throw error;
      } finally {
        this.depth--;
        this.session = null;
        await session.endSession();
      }
    });
  }
}
