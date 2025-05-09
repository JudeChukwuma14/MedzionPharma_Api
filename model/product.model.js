// backend/models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Vitamins',
      'Protein',
      'Omega Fatty Acids',
      'Performance',
      'Minerals',
      'Herbs',
      'Supplements',
      'Beauty & Personal Care',
      'Medical Devices',
      'Pain Relief',
      'Skin Care',
      'Pharmacy',
      'Sexual Wellbeing',
    ],
    default: 'Vitamins',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative'],
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: true,
  },
  images: [{
    type: String,
    default: [],
  }],
  brandName: {
    type: String,
    required: [true, 'Brand name is required'],
  },
  brandLogo: {
    type: String,
  },
  containerType: {
    type: String,
    required: [true, 'Container type is required'],
    enum: ['Glass Bottle', 'Plastic Container', 'Blister Pack', 'Jar', 'Pouch'],
    default: 'Plastic Container',
  },
  productForm: {
    type: String,
    required: [true, 'Product form is required'],
    enum: ['Softgel', 'Capsule', 'Tablet', 'Powder', 'Liquid'],
    default: 'Capsule',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);