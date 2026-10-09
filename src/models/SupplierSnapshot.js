import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  lastChanges: { type: mongoose.Schema.Types.Mixed },
  checkedAt: { type: Date },
  lastError: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.models.SupplierSnapshot || mongoose.model('SupplierSnapshot', schema);
