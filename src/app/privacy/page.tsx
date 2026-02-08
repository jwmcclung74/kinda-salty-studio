import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site.config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Kinda Salty Studio — how we handle your data.',
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="container-site py-10">
      <div className="mx-auto max-w-3xl prose prose-salt">
        <h1 className="section-heading">Privacy Policy</h1>
        <p className="text-sm text-salt-500">Last updated: February 2026</p>

        <div className="mt-8 space-y-6 text-salt-700 leading-relaxed text-sm">
          <p>Kinda Salty Studio (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates the website kindasaltystudio.com. This page informs you about our policies regarding the collection, use, and disclosure of personal information.</p>

          <h2 className="text-xl font-display text-salt-900">Information We Collect</h2>

          <h3 className="text-lg font-display text-salt-900">Email Signups</h3>
          <p>When you subscribe to our newsletter, we collect your email address and the date of signup. This data is stored securely and used solely to send you product announcements and updates. You can unsubscribe at any time by contacting us.</p>

          <h3 className="text-lg font-display text-salt-900">Contact &amp; Custom Order Forms</h3>
          <p>When you submit a contact or custom order form, we collect the information you provide (name, email, message content). This information is used only to respond to your inquiry.</p>

          <h3 className="text-lg font-display text-salt-900">Analytics (Google Analytics 4)</h3>
          <p>We use Google Analytics 4 (GA4) to understand how visitors use our site. GA4 collects anonymized data such as pages viewed, time on site, and general location (country/city level). GA4 uses cookies to distinguish unique users. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>

          <h2 className="text-xl font-display text-salt-900">Purchases</h2>
          <p>All purchases are processed through Etsy. We do not collect or store any payment information. Please refer to <a href="https://www.etsy.com/legal/privacy/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Etsy&apos;s Privacy Policy</a> for information about how they handle your data during checkout.</p>

          <h2 className="text-xl font-display text-salt-900">Data Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. Data may be shared with service providers (email delivery, analytics) solely for the purpose of operating this website.</p>

          <h2 className="text-xl font-display text-salt-900">Data Retention</h2>
          <p>Email signup data is retained until you request removal. Contact form submissions are retained for up to 12 months. Analytics data is retained per Google&apos;s default retention settings.</p>

          <h2 className="text-xl font-display text-salt-900">Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by emailing us at {siteConfig.contact.email}.</p>

          <h2 className="text-xl font-display text-salt-900">Contact</h2>
          <p>If you have any questions about this privacy policy, please contact us at {siteConfig.contact.email}.</p>
        </div>
      </div>
    </div>
  );
}
