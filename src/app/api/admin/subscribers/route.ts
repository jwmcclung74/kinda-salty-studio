import { NextRequest, NextResponse } from 'next/server';

function authorize(req: NextRequest): boolean {
  const token = req.nextUrl.searchParams.get('token');
  return !!token && token === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  try {
    const { sql } = await import('@vercel/postgres');
    await sql`CREATE TABLE IF NOT EXISTS subscribers (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, source VARCHAR(50), consent BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW())`;
    const result = await sql`SELECT id, email, source, consent, created_at FROM subscribers ORDER BY created_at DESC`;
    return NextResponse.json({ subscribers: result.rows });
  } catch (err) {
    console.error('Subscribers fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch subscribers.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Subscriber ID required.' }, { status: 400 });
  }

  try {
    const { sql } = await import('@vercel/postgres');
    const result = await sql`DELETE FROM subscribers WHERE id = ${parseInt(id, 10)}`;
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Subscriber removed.' });
  } catch (err) {
    console.error('Subscriber delete error:', err);
    return NextResponse.json({ error: 'Failed to remove subscriber.' }, { status: 500 });
  }
}
