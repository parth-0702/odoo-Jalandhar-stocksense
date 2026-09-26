import mongoose from 'mongoose';
export default mongoose.model('Ledger', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ['Receipt', 'Delivery', 'Transfer', 'Adjustment'], required: true },
  product: { type: String, required: true },
  quantityChange: { type: Number, required: true },
  fromLocation: { type: String, default: '' },
  toLocation: { type: String, default: '' },
  relatedDocument: { type: String, required: true },
  direction: { type: String, enum: ['IN', 'OUT'], required: true },
}));
