const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 }, // stored in cents
    compareAtPrice: { type: Number, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    inventory: {
      quantity: { type: Number, default: 0, min: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      sku: { type: String, unique: true, sparse: true },
      trackInventory: { type: Boolean, default: true },
    },
    shipping: {
      weight: { type: Number }, // in ounces
      freeShipping: { type: Boolean, default: false },
      processingDays: { type: Number, default: 3 },
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ tags: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { weights: { name: 10, tags: 5, description: 1 } }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
