import { NextRequest, NextResponse } from 'next/server';
import { clearListingsCache } from '@/lib/listings';

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  clearListingsCache();

  return NextResponse.json({
    message: 'Listings cache cleared. Next request will fetch fresh data.',
    timestamp: new Date().toISOString(),
  });
}
