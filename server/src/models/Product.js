import mongoose from 'mongoose';
export default mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, sku: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true }, unitOfMeasure: { type: String, required: true },
  perUnitCost: { type: Number, min: 0, required: true }, reorderThreshold: { type: Number, min: 0, default: 0 }, description: String,
}, { timestamps: true }));
