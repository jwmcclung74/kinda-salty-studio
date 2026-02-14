'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: { url: string; alt: string }[];
  isAvailable: boolean;
}

type CuratedMap = Record<string, string[]>;

export function AdminPanel() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [curated, setCurated] = useState<CuratedMap>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const categories = [
    { slug: '3d-prints', label: '3D Prints' },
    { slug: 'laser-engraving', label: 'Laser Engraving' },
  ];

  const loadData = useCallback(async (adminToken: string) => {
    setLoading(true);
    setMessage(null);

    try {
      // Fetch all Etsy listings
      const listingsRes = await fetch(`/api/admin/listings?token=${encodeURIComponent(adminToken)}`);
      if (!listingsRes.ok) {
        const err = await listingsRes.json();
        throw new Error(err.error || 'Failed to load listings');
      }
      const listingsData = await listingsRes.json();
      setListings(listingsData.listings);

      // Fetch curated assignments
      const curatedRes = await fetch(`/api/admin/curated-listings?token=${encodeURIComponent(adminToken)}`);
      if (curatedRes.ok) {
        const curatedData = await curatedRes.json();
        setCurated(curatedData.curated || {});
      }

      setAuthenticated(true);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to load', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (token.trim()) loadData(token.trim());
  }

  function isSelected(category: string, listingId: string): boolean {
    return curated[category]?.includes(listingId) ?? false;
  }

  function toggleListing(category: string, listingId: string) {
    setCurated((prev) => {
      const ids = prev[category] || [];
      if (ids.includes(listingId)) {
        return { ...prev, [category]: ids.filter((id) => id !== listingId) };
      }
      return { ...prev, [category]: [...ids, listingId] };
    });
  }

  async function saveCategory(category: string) {
    setSaving(category);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/curated-listings?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, listingIds: curated[category] || [] }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      const label = categories.find((c) => c.slug === category)?.label || category;
      setMessage({ text: `${label} listings saved!`, type: 'success' });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Save failed', type: 'error' });
    } finally {
      setSaving(null);
    }
  }

  // Login screen
  if (!authenticated) {
    return (
      <form onSubmit={handleLogin} className="max-w-md">
        <label className="block text-sm font-medium text-salt-700 mb-2">
          Admin Token
        </label>
        <div className="flex gap-3">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your admin token"
            className="input-field flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message.text}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="space-y-12">
      {message && (
        <div className={`rounded-sm px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {categories.map((cat) => {
        const selectedIds = curated[cat.slug] || [];
        return (
          <section key={cat.slug}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-display">{cat.label}</h2>
                <p className="text-sm text-salt-500">
                  {selectedIds.length} listing{selectedIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <button
                onClick={() => saveCategory(cat.slug)}
                disabled={saving === cat.slug}
                className="btn-primary text-sm"
              >
                {saving === cat.slug ? 'Saving...' : `Save ${cat.label}`}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {listings.map((listing) => {
                const selected = isSelected(cat.slug, listing.id);
                return (
                  <button
                    key={listing.id}
                    onClick={() => toggleListing(cat.slug, listing.id)}
                    className={`text-left rounded-sm border-2 p-2 transition-all ${
                      selected
                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                        : 'border-salt-200 hover:border-salt-400'
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-salt-100 rounded-sm mb-2">
                      <Image
                        src={listing.images[0]?.url || '/images/placeholder-product.svg'}
                        alt={listing.images[0]?.alt || listing.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover"
                      />
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {!listing.isAvailable && (
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-salt-900/80 text-white text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-salt-900 line-clamp-2">{listing.title}</p>
                    <p className="text-xs text-salt-500 mt-0.5">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
