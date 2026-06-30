import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDesc: { type: String, required: true, maxlength: 160 },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Fashion & Apparel Store',
        'Beauty & Personal Care Store',
        'Jewelry & Watches Store',
        'Home & Living Store',
        'Electronics & Gadgets Store',
        'Health & Wellness Store',
        'Food & Beverage Store',
        'Pet Supplies Store',
        'Baby & Kids Store',
        'Sports & Outdoor Store',
        'Automotive Store',
        'Books, Arts & Crafts Store',
        'Digital Products Store',
        'Print-on-Demand & Personalized Products Store',
        'Dropshipping Store',
        'Wholesale / B2B Store',
        'Subscription & Membership Store',
        'Marketplace / Multi-Vendor Store',
        'Service, Booking & Rental Website',
        'Luxury / Premium Brand Store',
        'Single Product Store',
        'General Multi-Category eCommerce Store'
      ],
      default: 'Fashion & Apparel Store',
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
