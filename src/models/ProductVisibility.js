import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  active: { type: Boolean, required: true },
}, { timestamps: true });

export default mongoose.models.ProductVisibility || mongoose.model('ProductVisibility', schema);
