import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

function authorize(req: NextRequest): boolean {
  const token =
    req.nextUrl.searchParams.get('token') ||
    req.headers.get('authorization')?.replace('Bearer ', '');
  return !!token && token === process.env.ADMIN_TOKEN;
}

// GET — return curated listing IDs grouped by category
export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
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

    const result = await sql`SELECT listing_id, category, sort_order FROM curated_listings ORDER BY category, sort_order`;

    const curated: Record<string, string[]> = {};
    for (const row of result.rows) {
      if (!curated[row.category]) curated[row.category] = [];
      curated[row.category].push(row.listing_id);
    }

    return NextResponse.json({ curated });
  } catch (err) {
    console.error('Curated listings fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch curated listings.' }, { status: 500 });
  }
}

// POST — save curated listing IDs for a category
// Body: { category: string, listingIds: string[] }
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  try {
    const { category, listingIds } = await req.json();

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
    }
    if (!Array.isArray(listingIds)) {
      return NextResponse.json({ error: 'listingIds must be an array.' }, { status: 400 });
    }

    const { sql } = await import('@vercel/postgres');
    await sql`CREATE TABLE IF NOT EXISTS curated_listings (
      id SERIAL PRIMARY KEY,
      listing_id VARCHAR(50) NOT NULL,
      category VARCHAR(50) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(listing_id, category)
    )`;

    // Clear existing entries for this category
    await sql`DELETE FROM curated_listings WHERE category = ${category}`;

    // Insert new entries
    for (let i = 0; i < listingIds.length; i++) {
      const listingId = listingIds[i];
      await sql`INSERT INTO curated_listings (listing_id, category, sort_order) VALUES (${listingId}, ${category}, ${i})`;
    }

    // Revalidate the category page so changes appear immediately
    const pathMap: Record<string, string> = {
      '3d-prints': '/3d-prints',
      'laser-engraving': '/laser-engraving',
      'featured': '/',
    };
    if (pathMap[category]) {
      revalidatePath(pathMap[category]);
    }
    // Also revalidate the home page in case it shows featured products
    revalidatePath('/');

    return NextResponse.json({
      message: `Saved ${listingIds.length} listings for ${category}.`,
    });
  } catch (err) {
    console.error('Curated listings save error:', err);
    return NextResponse.json({ error: 'Failed to save curated listings.' }, { status: 500 });
  }
}
