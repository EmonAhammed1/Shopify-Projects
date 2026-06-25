const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./models/Project');
const Admin = require('./models/Admin');

dotenv.config();

const demoProjects = [
  {
    title: 'LuxeWear Shopify Store',
    slug: 'luxewear-shopify-store',
    shortDesc: 'A premium fashion Shopify store with custom sections and conversion-optimized UX.',
    description:
      'LuxeWear is a full-featured fashion e-commerce store built on Shopify. The project included custom theme development, unique product section designs, cart upsell integrations, and a streamlined checkout flow. Resulted in a 38% increase in conversion rate post-launch.',
    category: 'Shopify',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    ],
    techStack: ['Shopify', 'Liquid', 'JavaScript', 'SCSS', 'Klaviyo'],
    liveUrl: 'https://example.com',
    githubUrl: '',
    featured: true,
    order: 1,
  },
  {
    title: 'GreenCart Organic Shop',
    slug: 'greencart-organic-shop',
    shortDesc: 'Eco-friendly product store with subscription boxes and loyalty program.',
    description:
      'GreenCart is an organic food and wellness Shopify store featuring subscription box functionality, loyalty rewards, and deep integration with Recharge Payments. Custom theme with earthy aesthetics and fast load times.',
    category: 'Shopify',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
    ],
    techStack: ['Shopify', 'Liquid', 'Recharge', 'Smile.io', 'SCSS'],
    liveUrl: 'https://example.com',
    githubUrl: '',
    featured: true,
    order: 2,
  },
  {
    title: 'TechDrop Electronics Store',
    slug: 'techdrop-electronics',
    shortDesc: 'High-performance electronics Shopify store with advanced filtering and comparison.',
    description:
      'TechDrop is a sleek electronics e-commerce store with advanced product filtering, comparison tools, and real-time inventory management. Integrated with multiple payment gateways and shipping APIs.',
    category: 'E-commerce',
    thumbnail: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    ],
    techStack: ['Shopify Plus', 'Liquid', 'React', 'Node.js', 'Algolia'],
    liveUrl: 'https://example.com',
    githubUrl: '',
    featured: true,
    order: 3,
  },
  {
    title: 'SkinGlow Beauty Brand',
    slug: 'skinglow-beauty',
    shortDesc: 'Beauty & skincare DTC brand with quiz-based product recommendations.',
    description:
      'SkinGlow is a direct-to-consumer beauty brand built on Shopify with a custom skin quiz for personalized product recommendations, before/after galleries, and influencer affiliate tracking.',
    category: 'Shopify',
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    ],
    techStack: ['Shopify', 'Liquid', 'JavaScript', 'Klaviyo', 'Refersion'],
    liveUrl: 'https://example.com',
    githubUrl: '',
    featured: false,
    order: 4,
  },
  {
    title: 'SportZone Athletic Gear',
    slug: 'sportzone-athletic',
    shortDesc: 'Multi-sport athletic gear store with custom bundle builder.',
    description:
      'SportZone is an athletic gear store featuring a custom bundle builder app, size guide integration, and a performance-optimized mobile experience. Reduced bounce rate by 45% with improved UX.',
    category: 'Shopify',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    ],
    techStack: ['Shopify', 'Liquid', 'JavaScript', 'SCSS', 'Custom App'],
    liveUrl: 'https://example.com',
    githubUrl: '',
    featured: false,
    order: 5,
  },
  {
    title: 'CraftHaven Handmade Market',
    slug: 'crafthaven-handmade',
    shortDesc: 'Multi-vendor handmade marketplace built on Shopify with custom storefront.',
    description:
      'CraftHaven is a multi-vendor marketplace concept built on Shopify with a headless storefront. Features vendor onboarding, custom storefronts per vendor, and a unified cart experience.',
    category: 'E-commerce',
    thumbnail: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    ],
    techStack: ['Shopify Hydrogen', 'React', 'GraphQL', 'Node.js', 'Tailwind'],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    featured: false,
    order: 6,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Project.deleteMany({});
    console.log('🗑️ Cleared existing projects');

    // Insert demo projects
    await Project.insertMany(demoProjects);
    console.log(`✅ Seeded ${demoProjects.length} demo projects`);

    // Create admin user if not exists
    const adminExists = await Admin.findOne({ email: 'admin@portfolio.com' });
    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        email: 'admin@portfolio.com',
        password: 'admin123456',
      });
      console.log('✅ Admin created: admin@portfolio.com / admin123456');
    } else {
      console.log('ℹ️ Admin already exists, skipping');
    }

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
