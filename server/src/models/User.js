import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  loginId: { type: String, required: true, unique: true, minlength: 6, maxlength: 12, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Password complexity/uniqueness is checked before storage by authService.
  passwordHash: { type: String, required: true, select: false },
  name: String, role: { type: String, default: 'Inventory Manager' },
}, { timestamps: true });
export default mongoose.model('User', schema);
