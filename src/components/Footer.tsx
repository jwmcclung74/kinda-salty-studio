import Link from 'next/link';
import { siteConfig } from '@/lib/site.config';
import { EmailSignup } from './EmailSignup';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-salt-900 text-salt-300">
      {/* Orange top accent */}
      <div className="h-1 bg-gradient-to-r from-accent via-accent-light to-accent" />
      <div className="container-site py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-xl font-display text-white">Kinda Salty</span>
              <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Studio</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-salt-400">
              Handcrafted 3D prints and laser engravings — made with care, shipped with love.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Navigate</h3>
            <ul className="space-y-2">
              {siteConfig.nav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-salt-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Info</h3>
            <ul className="space-y-2">
              <li>
                <a href={siteConfig.etsy.shopUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-salt-400 transition-colors hover:text-white">
                  Etsy Shop ↗
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-salt-400 transition-colors hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-salt-400 transition-colors hover:text-white">Terms of Service</Link>
              </li>
            </ul>
            {/* Social placeholders */}
            <div className="mt-6 flex gap-3">
              {siteConfig.social.instagram && (
                <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-salt-500 hover:text-accent transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Stay Updated</h3>
            <p className="text-sm text-salt-400 mb-4">New products and announcements, straight to your inbox.</p>
            <EmailSignup source="footer" variant="compact" />
          </div>
        </div>

        <div className="mt-12 border-t border-salt-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-salt-500">© {year} Kinda Salty Studio. All rights reserved.</p>
          <p className="text-xs text-salt-500">
            Handcrafted in the USA
          </p>
        </div>
      </div>
    </footer>
  );
}
