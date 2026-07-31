const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 180 },
    category: { type: String, required: true, trim: true, maxlength: 100, index: true },
    brand: { type: String, required: true, trim: true, maxlength: 100, index: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    specs: { type: Map, of: String, default: {} },
    images: {
      type: [{ type: String, trim: true }],
      default: [],
      validate: [(images) => images.length <= 8, 'A product can have up to eight images.'],
    },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);

