import { siteConfig } from './site.config';
import { NormalizedListing, ListingsData, ListingImage } from './types';
import { slugify } from './utils';
import fallbackData from '@/data/listings.json';

const ETSY_CACHE_TAG = 'etsy-listings';

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

interface GetListingsOptions {
  forceFresh?: boolean;
  skipFallback?: boolean;
}

function parseShopSlugFromUrl(url: string): string {
  const match = url.match(/etsy\.com\/shop\/([^/?#]+)/i);
  return match?.[1] || '';
}

function isNumericId(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

async function parseEtsyError(res: Response, url: string): Promise<Error> {
  let details = '';
  try {
    const text = await res.text();
    if (text) details = text.slice(0, 300);
  } catch {
    // ignore body parse failure
  }
  return new Error(`Etsy API error: ${res.status} at ${url}${details ? ` - ${details}` : ''}`);
}

async function resolveShopId(shopRef: string, headers: Record<string, string>): Promise<string> {
  const cleanRef = shopRef.trim();
  if (isNumericId(cleanRef)) return cleanRef;

  const lookupUrl = `https://openapi.etsy.com/v3/application/shops?shop_name=${encodeURIComponent(cleanRef)}`;
  const lookupRes = await fetch(lookupUrl, {
    headers,
    next: { revalidate: siteConfig.revalidate, tags: [ETSY_CACHE_TAG] },
  });
  if (!lookupRes.ok) throw await parseEtsyError(lookupRes, lookupUrl);

  const lookupJson = await lookupRes.json();
  const resolvedId = lookupJson?.results?.[0]?.shop_id;
  if (!resolvedId) {
    throw new Error(`No Etsy shop found for '${cleanRef}'.`);
  }

  return String(resolvedId);
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

const IMAGE_FETCH_CONCURRENCY = 5;
const IMAGE_FETCH_MAX_RETRIES = 3;

async function fetchListingImages(
  listingId: number,
  headers: Record<string, string>
): Promise<EtsyApiImage[] | null> {
  for (let attempt = 0; attempt <= IMAGE_FETCH_MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`https://openapi.etsy.com/v3/application/listings/${listingId}/images`, {
        headers,
        next: { revalidate: siteConfig.revalidate, tags: [ETSY_CACHE_TAG] },
      });
      if (res.ok) {
        const json = await res.json();
        return json.results || [];
      }
      // Non-retryable client error (other than rate limiting) — no point retrying
      if (res.status !== 429 && res.status < 500) return null;
    } catch {
      // Network error — fall through to retry
    }
    if (attempt < IMAGE_FETCH_MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
    }
  }
  return null;
}

// Fetch images for each listing with limited concurrency so we don't burst past
// Etsy's per-second rate limit and get every request throttled at once.
async function fetchListingImagesForAll(
  rawListings: EtsyApiListing[],
  headers: Record<string, string>
): Promise<Record<number, EtsyApiImage[]>> {
  const imageMap: Record<number, EtsyApiImage[]> = {};
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < rawListings.length) {
      const raw = rawListings[nextIndex++];
      const images = await fetchListingImages(raw.listing_id, headers);
      if (images !== null) imageMap[raw.listing_id] = images;
    }
  }

  const workerCount = Math.min(IMAGE_FETCH_CONCURRENCY, rawListings.length);
  await Promise.all(Array.from({ length: workerCount }, worker));

  return imageMap;
}

async function fetchFromEtsyApi(): Promise<NormalizedListing[]> {
  const { apiKey, sharedSecret, shopId } = siteConfig.etsy;
  if (!apiKey || !shopId) throw new Error('Etsy API key or shop ID not configured');

  const xApiKey = apiKey.includes(':')
    ? apiKey
    : sharedSecret
      ? `${apiKey}:${sharedSecret}`
      : apiKey;
  const headers = { 'x-api-key': xApiKey };
  const pageSize = 100;
  const shopRefs = Array.from(
    new Set([shopId, parseShopSlugFromUrl(siteConfig.etsy.shopUrl)].filter(Boolean))
  );

  // Fetch all active listings with pagination
  let baseUrl = '';
  let rawListings: EtsyApiListing[] = [];
  let lastError: Error | null = null;
  let shopResolved = false;

  for (const shopRef of shopRefs) {
    let resolvedShopId = '';
    try {
      resolvedShopId = await resolveShopId(shopRef, headers);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Failed to resolve Etsy shop ID.');
      continue;
    }

    baseUrl = `https://openapi.etsy.com/v3/application/shops/${resolvedShopId}`;
    rawListings = [];
    let offset = 0;
    let failed = false;

    while (true) {
      const listingsUrl = `${baseUrl}/listings/active?limit=${pageSize}&offset=${offset}`;
      const listingsRes = await fetch(listingsUrl, {
        headers,
        next: { revalidate: siteConfig.revalidate, tags: [ETSY_CACHE_TAG] },
      });

      if (!listingsRes.ok) {
        lastError = await parseEtsyError(listingsRes, listingsUrl);
        failed = true;
        break;
      }

      const listingsJson = await listingsRes.json();
      const batch: EtsyApiListing[] = listingsJson.results || [];
      rawListings.push(...batch);

      if (batch.length < pageSize) break;
      offset += pageSize;
    }

    if (!failed) {
      shopResolved = true;
      break;
    }
  }

  if (!shopResolved && lastError) {
    throw lastError;
  }

  // Optionally fetch shop sections for category mapping
  let sectionsMap: Record<number, string> = {};
  try {
    const sectionsRes = await fetch(`${baseUrl}/sections`, {
      headers,
      next: { revalidate: siteConfig.revalidate, tags: [ETSY_CACHE_TAG] },
    });
    if (sectionsRes.ok) {
      const sectionsJson = await sectionsRes.json();
      for (const sec of sectionsJson.results || []) {
        sectionsMap[sec.shop_section_id] = sec.title;
      }
    }
  } catch {
    // Non-critical
  }

  // Fetch images for each listing, throttled with retries to avoid Etsy's rate limit
  const imageMap = await fetchListingImagesForAll(rawListings, headers);

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

export async function getListings(options: GetListingsOptions = {}): Promise<NormalizedListing[]> {
  const { forceFresh = false, skipFallback = false } = options;
  // In-memory cache for the duration of a server lifecycle
  const now = Date.now();
  if (!forceFresh && cachedListings && now - cacheTimestamp < siteConfig.revalidate * 1000) {
    return cachedListings;
  }

  let etsyError: unknown = null;
  try {
    if (siteConfig.etsy.apiKey && siteConfig.etsy.shopId) {
      cachedListings = await fetchFromEtsyApi();
      cacheTimestamp = now;
      return cachedListings;
    }
  } catch (err) {
    etsyError = err;
    console.error('Etsy API fetch failed, falling back to file:', err);
  }

  if (skipFallback) {
    if (etsyError instanceof Error) throw etsyError;
    throw new Error('Etsy API key or shop ID not configured');
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

export { ETSY_CACHE_TAG };

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

    // Return listings in the curated sort order, with category matching this page
    return curatedIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is NormalizedListing => l != null)
      .map((l) => ({ ...l, category }));
  } catch (err) {
    console.error('Curated listings query failed, falling back to tag matching:', err);
    return listings.filter((l) => l.category === category);
  }
}

export async function getFeaturedListings(): Promise<NormalizedListing[]> {
  const listings = await getListings();

  if (!process.env.POSTGRES_URL) {
    return [];
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

    const result = await sql`SELECT listing_id FROM curated_listings WHERE category = 'featured' ORDER BY sort_order`;
    const featuredIds = result.rows.map((r) => r.listing_id);

    if (featuredIds.length === 0) return [];

    return featuredIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is NormalizedListing => l != null);
  } catch (err) {
    console.error('Featured listings query failed:', err);
    return [];
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
