/**
 * Fetch listings from Etsy API and export to src/data/listings.json
 * Usage: ETSY_API_KEY=xxx ETSY_SHOP_ID=yyy npx tsx scripts/fetch-listings.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const API_KEY = process.env.ETSY_API_KEY;
const SHOP_ID = process.env.ETSY_SHOP_ID;

if (!API_KEY || !SHOP_ID) {
  console.error('Usage: ETSY_API_KEY=xxx ETSY_SHOP_ID=yyy npx tsx scripts/fetch-listings.ts');
  process.exit(1);
}

function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80); }

function assignCategory(tags: string[], materials: string[], section?: string): string {
  const check = (arr: string[], patterns: string[]) => arr.some(a => patterns.some(p => a.toLowerCase().includes(p)));
  if (section && ['3D Print'].some(s => section.toLowerCase().includes(s.toLowerCase()))) return '3d-prints';
  if (section && ['Laser'].some(s => section.toLowerCase().includes(s.toLowerCase()))) return 'laser-engraving';
  if (check(tags, ['3d print', '3d printed', 'pla', 'resin print', 'fdm'])) return '3d-prints';
  if (check(tags, ['laser', 'engraved', 'laser cut'])) return 'laser-engraving';
  if (check(materials, ['pla', 'resin'])) return '3d-prints';
  if (check(materials, ['wood', 'acrylic'])) return 'laser-engraving';
  return 'uncategorized';
}

async function main() {
  const base = `https://openapi.etsy.com/v3/application/shops/${SHOP_ID}`;
  const headers = { 'x-api-key': API_KEY! };

  const res = await fetch(`${base}/listings/active?limit=100&includes=images`, { headers });
  if (!res.ok) { console.error(`Etsy API error: ${res.status}`); process.exit(1); }
  const json = await res.json();

  let sections: Record<number, string> = {};
  try {
    const sr = await fetch(`${base}/sections`, { headers });
    if (sr.ok) for (const s of (await sr.json()).results || []) sections[s.shop_section_id] = s.title;
  } catch {}

  const listings = (json.results || []).map((r: any) => {
    const sec = r.shop_section_id ? sections[r.shop_section_id] : undefined;
    const imgs = (r.images || []).map((i: any) => ({
      url: i.url_570xN || i.url_fullxfull, alt: i.alt_text || r.title,
      width: i.full_width || 570, height: i.full_height || 570, rank: i.rank,
    }));
    return {
      id: String(r.listing_id), slug: slugify(r.title) + '-' + r.listing_id,
      title: r.title, description: r.description,
      price: r.price.amount / r.price.divisor, currency: r.price.currency_code,
      images: imgs.length ? imgs : [{ url: '/images/placeholder-product.svg', alt: r.title, width: 800, height: 800, rank: 0 }],
      tags: r.tags || [], materials: r.materials || [],
      category: assignCategory(r.tags || [], r.materials || [], sec),
      createdAt: new Date(r.created_timestamp * 1000).toISOString(),
      updatedAt: new Date(r.updated_timestamp * 1000).toISOString(),
      listingUrl: r.url, quantity: r.quantity,
      isAvailable: r.state === 'active' && r.quantity > 0, shopSection: sec,
    };
  });

  const outPath = path.join(__dirname, '..', 'src', 'data', 'listings.json');
  fs.writeFileSync(outPath, JSON.stringify({ listings, fetchedAt: new Date().toISOString(), source: 'file' }, null, 2));
  console.log(`Exported ${listings.length} listings to ${outPath}`);
}

main().catch(console.error);
