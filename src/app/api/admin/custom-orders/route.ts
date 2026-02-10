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

    const orderId = req.nextUrl.searchParams.get('id');

    if (orderId) {
      // Fetch single order with file data
      const result = await sql`
        SELECT id, name, email, project_type, budget, timeline, description, files, status, created_at
        FROM custom_orders WHERE id = ${parseInt(orderId, 10)}
      `;
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      }
      return NextResponse.json({ order: result.rows[0] });
    }

    // Fetch all orders (without file data to keep response small)
    const result = await sql`
      SELECT id, name, email, project_type, budget, timeline, description,
        COALESCE(jsonb_array_length(files), 0) as file_count, status, created_at
      FROM custom_orders ORDER BY created_at DESC
    `;
    return NextResponse.json({ orders: result.rows });
  } catch (err) {
    console.error('Custom orders fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status required.' }, { status: 400 });
    }
    const validStatuses = ['new', 'reviewed', 'quoted', 'in-progress', 'completed', 'declined'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    const { sql } = await import('@vercel/postgres');
    const result = await sql`UPDATE custom_orders SET status = ${status} WHERE id = ${parseInt(id, 10)}`;
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Status updated.' });
  } catch (err) {
    console.error('Custom order update error:', err);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
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
    return NextResponse.json({ error: 'Order ID required.' }, { status: 400 });
  }

  try {
    const { sql } = await import('@vercel/postgres');
    const result = await sql`DELETE FROM custom_orders WHERE id = ${parseInt(id, 10)}`;
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Order removed.' });
  } catch (err) {
    console.error('Custom order delete error:', err);
    return NextResponse.json({ error: 'Failed to remove order.' }, { status: 500 });
  }
}
