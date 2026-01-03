// models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  cloudinaryId: {  // ✅ NEW FIELD
    type: String,
    default: null
  },
  tag: {
    type: String,
    enum: ['BEST SELLER', 'POPULAR', 'SALE', 'NEW', 'FEATURED'],
    default: 'FEATURED'
  },
  link: {
    type: String,
    default: '/'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);