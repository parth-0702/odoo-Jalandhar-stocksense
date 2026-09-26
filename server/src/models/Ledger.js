import mongoose from 'mongoose';
const ref = model => ({ type: mongoose.Schema.Types.ObjectId, ref: model });
export default mongoose.model('Ledger', new mongoose.Schema({ timestamp: { type: Date, default: Date.now }, type: { type: String, enum: ['Receipt', 'Delivery', 'Transfer', 'Adjustment'], required: true }, product: { ...ref('Product'), required: true }, quantityChange: { type: Number, required: true }, fromLocation: ref('Location'), toLocation: ref('Location'), relatedDocument: { ...ref('Document'), required: true }, direction: { type: String, enum: ['IN', 'OUT'], required: true } }));
