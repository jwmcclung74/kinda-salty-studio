import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 3;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

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
    const formData = await req.formData();

    // Honeypot check
    if (formData.get('website')) {
      return NextResponse.json({ message: 'Request submitted!' });
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const projectType = formData.get('projectType') as string;
    const budget = formData.get('budget') as string;
    const timeline = formData.get('timeline') as string;
    const description = formData.get('description') as string;

    if (!name || !email || !projectType || !description) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }

    // Process file uploads
    const files: { name: string; type: string; size: number; data: string }[] = [];
    for (let i = 0; i < MAX_FILES; i++) {
      const file = formData.get(`file${i}`) as File | null;
      if (!file || file.size === 0) continue;
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File "${file.name}" exceeds 5MB limit.` }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `File type "${file.type}" is not allowed.` }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      files.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: buffer.toString('base64'),
      });
    }

    // Save to database
    let orderId: number | null = null;
    if (process.env.POSTGRES_URL) {
      const { sql } = await import('@vercel/postgres');
      await sql`CREATE TABLE IF NOT EXISTS custom_orders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        project_type VARCHAR(100) NOT NULL,
        budget VARCHAR(50),
        timeline VARCHAR(255),
        description TEXT NOT NULL,
        files JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW()
      )`;
      const result = await sql`
        INSERT INTO custom_orders (name, email, project_type, budget, timeline, description, files)
        VALUES (${name}, ${email}, ${projectType}, ${budget || null}, ${timeline || null}, ${description}, ${JSON.stringify(files.map(f => ({ name: f.name, type: f.type, size: f.size, data: f.data })))})
        RETURNING id
      `;
      orderId = result.rows[0]?.id;
    }

    // Build admin link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kindasaltystudio.com';
    const adminLink = orderId
      ? `${siteUrl}/admin?tab=orders&order=${orderId}`
      : `${siteUrl}/admin?tab=orders`;

    // Build file attachment list for email
    const fileListHtml = files.length > 0
      ? `<p><strong>Attachments:</strong> ${files.map(f => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`).join(', ')}</p>`
      : '';

    // Send notification email to admin
    await sendEmail({
      to: 'jwmcclung@gmail.com',
      subject: `[Custom Order] ${projectType} from ${name}`,
      html: `
        <h2>New Custom Order Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${projectType}</p>
        <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
        ${fileListHtml}
        <hr/>
        <p><strong>Description:</strong></p>
        <p>${description.replace(/\n/g, '<br/>')}</p>
        <hr/>
        <p><a href="${adminLink}" style="display:inline-block;padding:10px 20px;background-color:#e97316;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">View in Admin Dashboard</a></p>
        <p style="font-size:12px;color:#666;">Or copy this link: ${adminLink}</p>
      `,
      replyTo: email,
    });

    return NextResponse.json({ message: 'Request submitted!' });
  } catch (err) {
    console.error('Custom order error:', err);
    return NextResponse.json({ error: 'Failed to send.' }, { status: 500 });
  }
}
