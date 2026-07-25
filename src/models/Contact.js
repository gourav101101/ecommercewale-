import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  formType: { type: String, required: true }, // 'general' or 'bulk'
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  
  // Bulk order specific fields
  companyName: { type: String },
  monthlyVolume: { type: String },
  productsNeeded: { type: String },
  
  status: { type: String, default: 'new' } // 'new', 'read', 'replied'
}, {
  timestamps: true
});

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
