import mongoose from 'mongoose';
export default mongoose.model('Counter', new mongoose.Schema({
  prefix: { type: String, unique: true, required: true },
  sequence: { type: Number, default: 0 },
}));
