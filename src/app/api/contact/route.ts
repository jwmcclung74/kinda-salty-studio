import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
    }

    const contactEmail = process.env.CONTACT_EMAIL || 'hello@kindasaltystudio.com';
    await sendEmail({
      to: contactEmail,
      subject: `[Contact] ${subject}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><hr/><p>${message.replace(/\n/g, '<br/>')}</p>`,
      replyTo: email,
    });

    return NextResponse.json({ message: 'Message sent!' });
  } catch {
    return NextResponse.json({ error: 'Failed to send.' }, { status: 500 });
  }
}
