import mongoose from 'mongoose';
// Mongo adapter: findOneAndUpdate({ prefix }, { $inc: { sequence: 1 } }, { upsert: true, new: true, session }).
export default mongoose.model('Counter', new mongoose.Schema({ prefix: { type: String, unique: true, required: true }, sequence: { type: Number, default: 0 } }));
