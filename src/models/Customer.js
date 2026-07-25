import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Using String to match the mock data, or could let Mongoose auto-gen _id, but keeping it simple for migration
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinDate: { type: String },
  city: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
