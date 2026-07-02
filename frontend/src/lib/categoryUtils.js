/**
 * Convert a category name to a URL-friendly slug
 * e.g. "Fashion & Apparel Store" → "fashion-apparel-store"
 */
export function categoryToSlug(category) {
  return category
    .toLowerCase()
    .replace(/&/g, '')          // remove ampersands
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-')       // spaces to dashes
    .replace(/-+/g, '-');       // collapse multiple dashes
}

/**
 * Find the original category name from a slug by matching against a list
 * e.g. "fashion-apparel-store" + categories → "Fashion & Apparel Store"
 */
export function slugToCategory(slug, categoriesList) {
  return categoriesList.find((cat) => categoryToSlug(cat) === slug) || null;
}

/**
 * Generate a short description for a category page hero
 */
export function getCategoryDescription(category) {
  const descriptions = {
    'Fashion & Apparel Store':
      'Premium Shopify stores for fashion brands — custom themes, lookbooks, size guides, and high-converting product pages.',
    'Beauty & Personal Care Store':
      'Luxury beauty and skincare storefronts built to captivate customers with stunning visuals and smart product discovery.',
    'Electronics & Gadgets Store':
      'High-performance electronics stores with advanced filtering, comparison tools, and technical spec layouts.',
    'General Multi-Category eCommerce Store':
      'Versatile multi-category Shopify stores designed to scale across product lines with seamless navigation.',
    'Sports & Outdoor Store':
      'Athletic and outdoor gear stores with bundle builders, activity finders, and performance-first UX.',
    'Marketplace / Multi-Vendor Store':
      'Multi-vendor marketplaces built on Shopify with advanced vendor management and headless storefronts.',
    'Home & Living Store':
      'Beautifully designed home décor and furniture stores with AR previews and room visualizations.',
    'Pet Supplies Store':
      'Friendly and engaging pet product stores designed for repeat buyers and subscription bundles.',
    'Health & Wellness Store':
      'Clean, trust-focused wellness stores with educational content, ingredient highlights, and compliance layouts.',
    'Wholesale / B2B Store':
      'B2B and wholesale Shopify stores with tiered pricing, bulk ordering, and account-gated catalogs.',
  };

  return (
    descriptions[category] ||
    `A curated collection of ${category} projects built on Shopify with premium design and conversion-focused UX.`
  );
}

/**
 * Generate an emoji icon for a category
 */
export function getCategoryIcon(category) {
  const icons = {
    'Fashion & Apparel Store': '👗',
    'Beauty & Personal Care Store': '✨',
    'Electronics & Gadgets Store': '⚡',
    'General Multi-Category eCommerce Store': '🛍️',
    'Sports & Outdoor Store': '🏋️',
    'Marketplace / Multi-Vendor Store': '🏪',
    'Home & Living Store': '🛋️',
    'Pet Supplies Store': '🐾',
    'Health & Wellness Store': '💚',
    'Wholesale / B2B Store': '📦',
  };
  return icons[category] || '🛒';
}
