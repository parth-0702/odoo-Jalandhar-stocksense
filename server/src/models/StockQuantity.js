import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productRef: { type: String, required: true },
  locationRef: { type: String, required: true },
  onHand: { type: Number, min: 0, default: 0 },
  freeToUse: { type: Number, min: 0, default: 0 },
}, { timestamps: true });
schema.path('freeToUse').validate(function(value) { return value <= this.onHand; }, 'Free to Use cannot exceed On Hand.');
schema.index({ productRef: 1, locationRef: 1 }, { unique: true });
export default mongoose.model('StockQuantity', schema);
