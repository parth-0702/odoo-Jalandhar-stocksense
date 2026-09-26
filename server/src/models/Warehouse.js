import mongoose from 'mongoose';
export default mongoose.model('Warehouse', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true, uppercase: true },
  address: { type: String, required: true },
}, { timestamps: true }));
