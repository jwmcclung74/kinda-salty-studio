import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, projectType, budget, timeline, description } = await req.json();
    if (!name || !email || !projectType || !description) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    const contactEmail = process.env.CONTACT_EMAIL || 'hello@kindasaltystudio.com';
    await sendEmail({
      to: contactEmail,
      subject: `[Custom Order] ${projectType} from ${name}`,
      html: `
        <h2>Custom Order Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${projectType}</p>
        <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
        <hr/>
        <p><strong>Description:</strong></p>
        <p>${description.replace(/\n/g, '<br/>')}</p>
      `,
      replyTo: email,
    });

    return NextResponse.json({ message: 'Request submitted!' });
  } catch {
    return NextResponse.json({ error: 'Failed to send.' }, { status: 500 });
  }
}
