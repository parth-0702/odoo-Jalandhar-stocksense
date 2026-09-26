import mongoose from 'mongoose';
import { FLOWS } from '../domain/flows.js';
const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: Object.keys(FLOWS), required: true },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'], default: 'Draft', validate: { validator: function(value) { return value === 'Canceled' || FLOWS[this.type]?.includes(value); }, message: 'Status is invalid for this document type.' } },
  contact: { type: String, required: true },
  scheduleDate: { type: String, required: true },
  responsible: { type: String, required: true },
  warehouseRef: { type: String, required: true },
  fromLocation: { type: String, default: '' },
  toLocation: { type: String, default: '' },
  lines: [{ _id: false, product: { type: String, required: true }, quantity: { type: Number, min: 0, required: true } }],
  operationType: String,
  notes: String,
  completedAt: String,
  pickedAt: String,
  pickedBy: String,
  packedAt: String,
  packedBy: String,
}, { timestamps: true });
export default mongoose.model('Document', schema);
