import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  try {
    const { email, source } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }

    if (process.env.POSTGRES_URL) {
      const { sql } = await import('@vercel/postgres');
      await sql`CREATE TABLE IF NOT EXISTS subscribers (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, source VARCHAR(50), consent BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW())`;
      await sql`INSERT INTO subscribers (email, source) VALUES (${email.toLowerCase().trim()}, ${source || 'unknown'}) ON CONFLICT (email) DO NOTHING`;
      return NextResponse.json({ message: "You're on the list! 🎉" });
    }

    console.log(`[EMAIL SIGNUP] ${email} from ${source} at ${new Date().toISOString()}`);
    return NextResponse.json({ message: "You're on the list! 🎉" });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
