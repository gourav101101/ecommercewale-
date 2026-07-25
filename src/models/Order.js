import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  email: { type: String, required: true },
  items: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  date: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  // New fields for real checkout
  products: [{
    id: String,
    name: String,
    quantity: Number,
    price: Number,
    selectedSize: String
  }],
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  gstin: String,
  companyName: String
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
