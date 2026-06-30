import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDesc: { type: String, required: true, maxlength: 160 },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Shopify', 'E-commerce', 'Landing Page', 'Web App', 'Other'],
      default: 'Shopify',
    },
    thumbnail: { type: String, default: '' },
    screenshots: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    liveUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    storefrontPassword: { type: String, default: '' },
    themeUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    pages: {
      type: [{
        name: { type: String, required: true },
        path: { type: String, required: true }
      }],
      default: []
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
