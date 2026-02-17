import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { clearListingsCache, ETSY_CACHE_TAG } from '@/lib/listings';

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  clearListingsCache();
  revalidateTag(ETSY_CACHE_TAG);

  return NextResponse.json({
    message: 'Listings cache cleared and Etsy cache invalidated. Next request will fetch fresh data.',
    timestamp: new Date().toISOString(),
  });
}
