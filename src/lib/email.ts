interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EMAIL PLACEHOLDER] To: ${to} | Subject: ${subject} | Reply-To: ${replyTo || 'n/a'}`);
    return true;
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Kinda Salty Studio <noreply@kindasaltystudio.com>',
      to,
      subject,
      html,
      replyTo,
    });
    return true;
  } catch (err) {
    console.error('Resend error:', err);
    return false;
  }
}
