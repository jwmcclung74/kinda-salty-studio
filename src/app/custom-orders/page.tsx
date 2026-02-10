import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site.config';
import { CustomOrderForm } from '@/components/CustomOrderForm';

export const metadata: Metadata = {
  title: 'Custom Orders',
  description: 'Request a custom 3D print or laser engraving from Kinda Salty Studio. We bring your ideas to life.',
  alternates: { canonical: `${siteConfig.url}/custom-orders` },
};

export default function CustomOrdersPage() {
  return (
    <div className="container-site py-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Made for You</p>
        <h1 className="section-heading">Custom Orders</h1>
        <p className="section-subheading mb-4">
          Have a specific idea? We love custom projects. Tell us what you&apos;re looking for and we&apos;ll work together to make it happen.
        </p>
        <div className="mb-8 rounded border border-accent/20 bg-accent/5 p-4">
          <h2 className="text-sm font-semibold text-salt-900 mb-2">How it works</h2>
          <ol className="text-sm text-salt-600 space-y-1 list-decimal list-inside">
            <li>Submit your idea below with as much detail as possible.</li>
            <li>We&apos;ll review and reply within 1–2 business days with a quote.</li>
            <li>Once approved, we&apos;ll create your custom piece and ship it to you.</li>
          </ol>
        </div>
        <CustomOrderForm />
      </div>
    </div>
  );
}
