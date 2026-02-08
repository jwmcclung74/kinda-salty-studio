import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  try {
    const { sql } = await import('@vercel/postgres');
    const result = await sql`SELECT email, source, consent, created_at FROM subscribers ORDER BY created_at DESC`;

    // CSV format
    const header = 'email,source,consent,created_at';
    const rows = result.rows.map((r) => `${r.email},${r.source},${r.consent},${r.created_at}`);
    const csv = [header, ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Export failed.' }, { status: 500 });
  }
}
