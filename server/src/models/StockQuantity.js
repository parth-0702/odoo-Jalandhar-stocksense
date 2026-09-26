import mongoose from 'mongoose';
const schema = new mongoose.Schema({ productRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, locationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }, onHand: { type: Number, min: 0, default: 0 }, freeToUse: { type: Number, min: 0, default: 0 } }, { timestamps: true });
schema.path('freeToUse').validate(function(value) { return value <= this.onHand; }, 'Free to Use cannot exceed On Hand.');
schema.index({ productRef: 1, locationRef: 1 }, { unique: true });
export default mongoose.model('StockQuantity', schema);
