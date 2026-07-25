import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortName: { type: String },
  category: { type: String, required: true },
  type: { type: String },
  description: { type: String },
  features: [{ type: String }],
  specs: { type: Map, of: String },
  marketplaceCompatible: [{ type: String }],
  sizes: [{
    label: { type: String },
    value: { type: String },
    dimensions: { type: String }
  }],
  pricing: [{
    minQty: { type: Number },
    maxQty: { type: Number },
    pricePerUnit: { type: Number },
    label: { type: String }
  }],
  basePrice: { type: Number, required: true },
  bulkPrice: { type: Number, required: true },
  image: { type: String },
  gallery: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  bestSeller: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  reviews: [{
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
