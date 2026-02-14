import { siteConfig } from './site.config';
import { NormalizedListing, ListingsData, ListingImage } from './types';
import { slugify } from './utils';
import fallbackData from '@/data/listings.json';

// ── Category Assignment ──────────────────────────────────────

function assignCategory(tags: string[], materials: string[], section?: string): string {
  const lower = (arr: string[]) => arr.map((s) => s.toLowerCase());

  for (const [slug, cat] of Object.entries(siteConfig.categories)) {
    // Match by section name
    if (section && cat.matchSections.some((s) => section.toLowerCase().includes(s.toLowerCase()))) {
      return slug;
    }
    // Match by tag
    const lowerTags = lower(tags);
    if (cat.matchTags.some((t) => lowerTags.some((lt) => lt.includes(t)))) {
      return slug;
    }
    // Match by material
    const lowerMats = lower(materials);
    if (cat.matchTags.some((t) => lowerMats.some((lm) => lm.includes(t)))) {
      return slug;
    }
  }
  return 'uncategorized';
}

// ── Etsy API ──────────────────────────────────────────────────

interface EtsyApiListing {
  listing_id: number;
  title: string;
  description: string;
  price: { amount: number; divisor: number; currency_code: string };
  tags: string[];
  materials: string[];
  state: string;
  quantity: number;
  url: string;
  created_timestamp: number;
  updated_timestamp: number;
  images?: EtsyApiImage[];
  shop_section_id?: number;
}

interface EtsyApiImage {
  url_fullxfull: string;
  url_570xN: string;
  alt_text: string;
  full_width: number;
  full_height: number;
  rank: number;
}

function normalizeEtsyListing(raw: EtsyApiListing, sectionName?: string): NormalizedListing {
  const images: ListingImage[] = (raw.images || []).map((img) => ({
    url: img.url_570xN || img.url_fullxfull,
    alt: img.alt_text || raw.title,
    width: img.full_width || 570,
    height: img.full_height || 570,
    rank: img.rank,
  }));

  return {
    id: String(raw.listing_id),
    slug: slugify(raw.title) + '-' + raw.listing_id,
    title: raw.title,
    description: raw.description,
    price: raw.price.amount / raw.price.divisor,
    currency: raw.price.currency_code,
    images: images.length > 0 ? images : [{ url: '/images/placeholder-product.svg', alt: raw.title, width: 800, height: 800, rank: 0 }],
    tags: raw.tags || [],
    materials: raw.materials || [],
    category: assignCategory(raw.tags || [], raw.materials || [], sectionName),
    createdAt: new Date(raw.created_timestamp * 1000).toISOString(),
    updatedAt: new Date(raw.updated_timestamp * 1000).toISOString(),
    listingUrl: raw.url,
    quantity: raw.quantity,
    isAvailable: raw.state === 'active' && raw.quantity > 0,
    shopSection: sectionName,
  };
}

async function fetchFromEtsyApi(): Promise<NormalizedListing[]> {
  const { apiKey, shopId } = siteConfig.etsy;
  if (!apiKey || !shopId) throw new Error('Etsy API key or shop ID not configured');

  const baseUrl = `https://openapi.etsy.com/v3/application/shops/${shopId}`;
  const headers = { 'x-api-key': apiKey };

  // Fetch active listings
  const listingsRes = await fetch(`${baseUrl}/listings/active?limit=100`, {
    headers,
    next: { revalidate: siteConfig.revalidate },
  });
  if (!listingsRes.ok) throw new Error(`Etsy API error: ${listingsRes.status}`);
  const listingsJson = await listingsRes.json();

  // Optionally fetch shop sections for category mapping
  let sectionsMap: Record<number, string> = {};
  try {
    const sectionsRes = await fetch(`${baseUrl}/sections`, { headers });
    if (sectionsRes.ok) {
      const sectionsJson = await sectionsRes.json();
      for (const sec of sectionsJson.results || []) {
        sectionsMap[sec.shop_section_id] = sec.title;
      }
    }
  } catch {
    // Non-critical
  }

  // Fetch images for each listing in parallel
  const rawListings: EtsyApiListing[] = listingsJson.results || [];
  const imageResults = await Promise.allSettled(
    rawListings.map((raw) =>
      fetch(`https://openapi.etsy.com/v3/application/listings/${raw.listing_id}/images`, { headers })
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((json) => ({ listingId: raw.listing_id, images: json.results || [] }))
    )
  );

  const imageMap: Record<number, EtsyApiImage[]> = {};
  for (const result of imageResults) {
    if (result.status === 'fulfilled') {
      imageMap[result.value.listingId] = result.value.images;
    }
  }

  return rawListings.map((raw) => {
    const rawWithImages = { ...raw, images: imageMap[raw.listing_id] || raw.images };
    return normalizeEtsyListing(rawWithImages, raw.shop_section_id ? sectionsMap[raw.shop_section_id] : undefined);
  });
}

// ── Fallback file-based source ────────────────────────────────

function loadFallbackListings(): NormalizedListing[] {
  const data = fallbackData as ListingsData;
  // Re-assign categories in case config changed
  return data.listings.map((l) => ({
    ...l,
    category: assignCategory(l.tags, l.materials, l.shopSection),
  }));
}

// ── Public API ─────────────────────────────────────────────────

let cachedListings: NormalizedListing[] | null = null;
let cacheTimestamp = 0;

export async function getListings(): Promise<NormalizedListing[]> {
  // In-memory cache for the duration of a server lifecycle
  const now = Date.now();
  if (cachedListings && now - cacheTimestamp < siteConfig.revalidate * 1000) {
    return cachedListings;
  }

  try {
    if (siteConfig.etsy.apiKey && siteConfig.etsy.shopId) {
      cachedListings = await fetchFromEtsyApi();
      cacheTimestamp = now;
      return cachedListings;
    }
  } catch (err) {
    console.error('Etsy API fetch failed, falling back to file:', err);
  }

  cachedListings = loadFallbackListings();
  cacheTimestamp = now;
  return cachedListings;
}

export async function getListingBySlug(slug: string): Promise<NormalizedListing | null> {
  const listings = await getListings();
  return listings.find((l) => l.slug === slug) || null;
}

export async function getListingsByCategory(category: string): Promise<NormalizedListing[]> {
  const listings = await getListings();
  return listings.filter((l) => l.category === category);
}

export async function searchListings(query: string): Promise<NormalizedListing[]> {
  const listings = await getListings();
  const q = query.toLowerCase();
  return listings.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q)) ||
      l.materials.some((m) => m.toLowerCase().includes(q))
  );
}

export async function getAllTags(): Promise<string[]> {
  const listings = await getListings();
  const tags = new Set<string>();
  listings.forEach((l) => l.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export async function getAllMaterials(): Promise<string[]> {
  const listings = await getListings();
  const mats = new Set<string>();
  listings.forEach((l) => l.materials.forEach((m) => mats.add(m)));
  return Array.from(mats).sort();
}

export function clearListingsCache(): void {
  cachedListings = null;
  cacheTimestamp = 0;
}

export async function getCuratedListingsByCategory(category: string): Promise<NormalizedListing[]> {
  const listings = await getListings();

  if (!process.env.POSTGRES_URL) {
    // Fall back to tag-based matching if no database
    return listings.filter((l) => l.category === category);
  }

  try {
    const { sql } = await import('@vercel/postgres');
    await sql`CREATE TABLE IF NOT EXISTS curated_listings (
      id SERIAL PRIMARY KEY,
      listing_id VARCHAR(50) NOT NULL,
      category VARCHAR(50) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(listing_id, category)
    )`;

    const result = await sql`SELECT listing_id FROM curated_listings WHERE category = ${category} ORDER BY sort_order`;
    const curatedIds = result.rows.map((r) => r.listing_id);

    if (curatedIds.length === 0) {
      // No curated listings configured yet — fall back to tag-based matching
      return listings.filter((l) => l.category === category);
    }

    // Return listings in the curated sort order
    return curatedIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is NormalizedListing => l != null);
  } catch (err) {
    console.error('Curated listings query failed, falling back to tag matching:', err);
    return listings.filter((l) => l.category === category);
  }
}

export async function getRelatedListings(listing: NormalizedListing, limit: number = 4): Promise<NormalizedListing[]> {
  const all = await getListings();
  const scored = all
    .filter((l) => l.id !== listing.id)
    .map((l) => {
      let score = 0;
      if (l.category === listing.category) score += 3;
      const sharedTags = l.tags.filter((t) => listing.tags.includes(t)).length;
      score += sharedTags;
      const sharedMats = l.materials.filter((m) => listing.materials.includes(m)).length;
      score += sharedMats;
      return { listing: l, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.listing);
}
