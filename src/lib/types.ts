export interface ListingImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  rank: number;
}

export interface NormalizedListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: ListingImage[];
  tags: string[];
  materials: string[];
  category: string; // '3d-prints' | 'laser-engraving' | 'uncategorized'
  createdAt: string; // ISO
  updatedAt: string; // ISO
  listingUrl: string;
  quantity: number;
  isAvailable: boolean;
  shopSection?: string;
}

export interface ListingsData {
  listings: NormalizedListing[];
  fetchedAt: string;
  source: 'api' | 'file';
}
