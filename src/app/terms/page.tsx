import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site.config';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Kinda Salty Studio.',
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return (
    <div className="container-site py-10">
      <div className="mx-auto max-w-3xl prose prose-salt">
        <h1 className="section-heading">Terms of Service</h1>
        <p className="text-sm text-salt-500">Last updated: February 2026</p>

        <div className="mt-8 space-y-6 text-salt-700 leading-relaxed text-sm">
          <h2 className="text-xl font-display text-salt-900">Overview</h2>
          <p>This website is operated by Kinda Salty Studio. By visiting our site and/or purchasing something from us via Etsy, you agree to these terms.</p>

          <h2 className="text-xl font-display text-salt-900">Products</h2>
          <p>All products displayed on this website are also listed on our Etsy shop. Purchases, payments, shipping, and returns are handled through Etsy and are subject to Etsy&apos;s terms of service and our Etsy shop policies.</p>

          <h2 className="text-xl font-display text-salt-900">Custom Orders</h2>
          <p>Custom order requests submitted through this website are non-binding inquiries. A custom order becomes binding only after both parties agree on specifications, pricing, and timeline via direct communication.</p>

          <h2 className="text-xl font-display text-salt-900">Intellectual Property</h2>
          <p>All content on this site — including product photos, descriptions, designs, and branding — is the property of Kinda Salty Studio and may not be reproduced without permission.</p>

          <h2 className="text-xl font-display text-salt-900">Accuracy</h2>
          <p>We strive to display our products as accurately as possible. However, colors and details may vary slightly due to monitor settings and the handmade nature of our products.</p>

          <h2 className="text-xl font-display text-salt-900">Limitation of Liability</h2>
          <p>Kinda Salty Studio shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website.</p>

          <h2 className="text-xl font-display text-salt-900">Changes</h2>
          <p>We reserve the right to update these terms at any time. Changes will be posted on this page with an updated date.</p>

          <h2 className="text-xl font-display text-salt-900">Contact</h2>
          <p>Questions about these terms? Email us at {siteConfig.contact.email}.</p>
        </div>
      </div>
    </div>
  );
}
