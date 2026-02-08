'use client';

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export const gaEnabled = (): boolean => !!GA_ID;

// Standard GA4 pageview (handled by gtag config, but useful for SPA nav)
export function pageview(url: string) {
  if (!gaEnabled() || typeof window === 'undefined') return;
  window.gtag?.('config', GA_ID, { page_path: url });
}

// Custom event tracking
export function trackEvent(action: string, params?: Record<string, string | number>) {
  if (!gaEnabled() || typeof window === 'undefined') return;
  window.gtag?.('event', action, params);
}

// Specific events
export function trackViewOnEtsy(listingTitle: string, listingUrl: string) {
  trackEvent('view_on_etsy', {
    listing_title: listingTitle,
    listing_url: listingUrl,
  });
}

export function trackEmailSignup(source: string) {
  trackEvent('email_signup', { source });
}

export function trackContactSubmit() {
  trackEvent('contact_submit');
}

export function trackCustomOrderSubmit() {
  trackEvent('custom_order_submit');
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
