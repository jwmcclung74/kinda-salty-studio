'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface ShopFiltersProps {
  tags: string[];
  materials: string[];
  categories: { slug: string; label: string }[];
}

export function ShopFilters({ tags, materials, categories }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentQuery = searchParams.get('q') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentMaterial = searchParams.get('material') || '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="search"
          placeholder="Search products..."
          defaultValue={currentQuery}
          onChange={(e) => {
            // Debounce by using the form approach
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParam('q', (e.target as HTMLInputElement).value);
            }
          }}
          className="input-field"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Category */}
        <select
          value={currentCategory}
          onChange={(e) => updateParam('category', e.target.value)}
          className="input-field w-auto text-sm"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Tag */}
        <select
          value={currentTag}
          onChange={(e) => updateParam('tag', e.target.value)}
          className="input-field w-auto text-sm"
          aria-label="Filter by tag"
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        {/* Material */}
        <select
          value={currentMaterial}
          onChange={(e) => updateParam('material', e.target.value)}
          className="input-field w-auto text-sm"
          aria-label="Filter by material"
        >
          <option value="">All Materials</option>
          {materials.map((mat) => (
            <option key={mat} value={mat}>
              {mat}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="input-field w-auto text-sm"
          aria-label="Sort by"
        >
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="title">A → Z</option>
        </select>
      </div>

      {/* Active filters */}
      {(currentCategory || currentTag || currentMaterial || currentQuery) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-salt-500">Active:</span>
          {currentQuery && (
            <button onClick={() => updateParam('q', '')} className="inline-flex items-center gap-1 rounded-full bg-salt-200 px-3 py-1 text-xs text-salt-700 hover:bg-salt-300 transition-colors">
              &ldquo;{currentQuery}&rdquo; ×
            </button>
          )}
          {currentCategory && (
            <button onClick={() => updateParam('category', '')} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent hover:bg-accent/20 transition-colors">
              {currentCategory} ×
            </button>
          )}
          {currentTag && (
            <button onClick={() => updateParam('tag', '')} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent hover:bg-accent/20 transition-colors">
              {currentTag} ×
            </button>
          )}
          {currentMaterial && (
            <button onClick={() => updateParam('material', '')} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent hover:bg-accent/20 transition-colors">
              {currentMaterial} ×
            </button>
          )}
          <button
            onClick={() => router.push('/shop')}
            className="text-xs text-salt-500 hover:text-accent transition-colors underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
