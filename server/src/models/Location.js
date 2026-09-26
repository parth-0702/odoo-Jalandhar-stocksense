import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortCode: { type: String, required: true, uppercase: true },
  warehouseRef: { type: String, required: true },
}, { timestamps: true });
schema.index({ warehouseRef: 1, shortCode: 1 }, { unique: true });
export default mongoose.model('Location', schema);
