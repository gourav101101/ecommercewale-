import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  active: { type: Boolean, required: true },
}, { timestamps: true });

export default mongoose.models.CategorySetting || mongoose.model('CategorySetting', schema);
