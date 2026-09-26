import mongoose from 'mongoose';
import { FLOWS } from '../services/inventoryService.js';
const ref = model => ({ type: mongoose.Schema.Types.ObjectId, ref: model });
const schema = new mongoose.Schema({
  type: { type: String, enum: Object.keys(FLOWS), required: true }, reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'], default: 'Draft', validate: { validator: function(value) { return value === 'Canceled' || FLOWS[this.type]?.includes(value); }, message: 'Status is invalid for this document type.' } },
  contact: { type: String, required: true }, scheduleDate: { type: Date, required: true }, responsible: { ...ref('User'), required: true },
  warehouseRef: { ...ref('Warehouse'), required: true }, fromLocation: ref('Location'), toLocation: ref('Location'),
  lines: [{ product: { ...ref('Product'), required: true }, quantity: { type: Number, min: 0, required: true } }], operationType: String, notes: String, completedAt: Date,
}, { timestamps: true });
export default mongoose.model('Document', schema);
