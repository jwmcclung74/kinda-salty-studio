'use client';

import Link from 'next/link';
import { useState } from 'react';
import { siteConfig } from '@/lib/site.config';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-salt-200 bg-salt-50/95 backdrop-blur-sm">
      <div className="container-site flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-xl font-display tracking-tight text-salt-900 transition-colors group-hover:text-accent">
            Kinda Salty
          </span>
          <span className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-salt-500">
            Studio
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-salt-600 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <a
            href={siteConfig.etsy.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-accent px-4 py-2 text-xs font-semibold tracking-wide text-white uppercase transition-colors hover:bg-accent-dark"
          >
            Shop on Etsy
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-salt-700"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-salt-200 bg-salt-50 pb-4" aria-label="Mobile navigation">
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-3 text-sm font-medium text-salt-700 transition-colors hover:bg-salt-100 hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 pt-3">
            <a
              href={siteConfig.etsy.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center text-xs"
            >
              Shop on Etsy →
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
