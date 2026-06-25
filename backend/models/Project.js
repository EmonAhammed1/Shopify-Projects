const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDesc: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: 160,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['Shopify', 'E-commerce', 'Landing Page', 'Web App', 'Other'],
      default: 'Shopify',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    screenshots: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    liveUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
