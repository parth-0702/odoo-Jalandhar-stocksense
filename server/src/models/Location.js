import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: { type: String, required: true }, shortCode: { type: String, required: true, uppercase: true }, warehouseRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true } }, { timestamps: true });
schema.index({ warehouseRef: 1, shortCode: 1 }, { unique: true });
export default mongoose.model('Location', schema);
