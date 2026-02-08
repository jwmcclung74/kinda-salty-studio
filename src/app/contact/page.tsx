import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site.config';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Kinda Salty Studio — questions, feedback, or just say hi.',
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div className="container-site py-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Get in Touch</p>
        <h1 className="section-heading">Contact Us</h1>
        <p className="section-subheading mb-8">
          Questions about a product, order, or anything else? Drop us a line and we&apos;ll get back to you.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
