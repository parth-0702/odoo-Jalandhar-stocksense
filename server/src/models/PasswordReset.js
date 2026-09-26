import mongoose from 'mongoose';
export default mongoose.model('PasswordReset', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  otp: { type: String, required: true },
  expires: { type: Number, required: true },
  verified: { type: Boolean, default: false },
  resetToken: String,
}, { timestamps: true }));
