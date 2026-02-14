import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/listings';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listings = await getListings();
    return NextResponse.json({ listings });
  } catch (err) {
    console.error('Admin listings fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch listings.' }, { status: 500 });
  }
}
