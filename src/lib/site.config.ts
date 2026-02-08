export const siteConfig = {
  name: 'Kinda Salty Studio',
  tagline: 'Handcrafted 3D Prints & Laser Engravings',
  description:
    'Unique 3D printed models and laser engraved creations, handcrafted with care. Browse our collection of custom designs, home décor, and personalized gifts.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kindasaltystudio.com',
  ogImage: '/og-default.jpg',

  etsy: {
    shopUrl: 'https://www.etsy.com/shop/KindaSaltyStudio',
    shopId: process.env.ETSY_SHOP_ID || '',
    apiKey: process.env.ETSY_API_KEY || '',
  },

  // Map Etsy tags/sections to site categories
  categories: {
    '3d-prints': {
      label: '3D Prints',
      description: 'Custom 3D printed models, figurines, home décor, and functional prints.',
      matchTags: ['3d print', '3d printed', '3d printing', 'pla', 'resin print', 'fdm'],
      matchSections: ['3D Prints', '3D Printed'],
      href: '/3d-prints',
    },
    'laser-engraving': {
      label: 'Laser Engraving',
      description: 'Precision laser engraved signs, ornaments, coasters, and personalized gifts.',
      matchTags: ['laser', 'laser engraved', 'laser cut', 'engraved', 'wood', 'acrylic'],
      matchSections: ['Laser Engraving', 'Laser Engraved', 'Laser Cut'],
      href: '/laser-engraving',
    },
  } as Record<string, CategoryConfig>,

  // Listing IDs to feature on homepage (update after fetching)
  featuredListingIds: [] as string[],

  social: {
    instagram: '',
    tiktok: '',
    facebook: '',
    pinterest: '',
    youtube: '',
  },

  contact: {
    email: process.env.CONTACT_EMAIL || 'hello@kindasaltystudio.com',
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: '3D Prints', href: '/3d-prints' },
    { label: 'Laser Engraving', href: '/laser-engraving' },
    { label: 'Custom Orders', href: '/custom-orders' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],

  revalidate: 21600, // 6 hours in seconds
} as const;

export interface CategoryConfig {
  label: string;
  description: string;
  matchTags: string[];
  matchSections: string[];
  href: string;
}

export type CategorySlug = keyof typeof siteConfig.categories;
