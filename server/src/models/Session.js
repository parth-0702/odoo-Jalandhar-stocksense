import mongoose from 'mongoose';
export default mongoose.model('Session', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
}, { timestamps: true }));
