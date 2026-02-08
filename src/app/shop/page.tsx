import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getListings, getAllTags, getAllMaterials } from '@/lib/listings';
import { siteConfig } from '@/lib/site.config';
import { ProductGrid } from '@/components/ProductGrid';
import { ShopFilters } from '@/components/ShopFilters';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NormalizedListing } from '@/lib/types';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our full collection of 3D printed models, laser engravings, and handcrafted gifts from Kinda Salty Studio.',
  alternates: { canonical: `${siteConfig.url}/shop` },
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    material?: string;
    sort?: string;
    q?: string;
  }>;
}

function filterAndSort(
  listings: NormalizedListing[],
  params: { category?: string; tag?: string; material?: string; sort?: string; q?: string }
): NormalizedListing[] {
  let filtered = [...listings];

  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (params.category) {
    filtered = filtered.filter((l) => l.category === params.category);
  }

  if (params.tag) {
    filtered = filtered.filter((l) =>
      l.tags.some((t) => t.toLowerCase() === params.tag!.toLowerCase())
    );
  }

  if (params.material) {
    filtered = filtered.filter((l) =>
      l.materials.some((m) => m.toLowerCase() === params.material!.toLowerCase())
    );
  }

  switch (params.sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return filtered;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [allListings, tags, materials] = await Promise.all([
    getListings(),
    getAllTags(),
    getAllMaterials(),
  ]);

  const categories = Object.entries(siteConfig.categories).map(([slug, cat]) => ({
    slug,
    label: cat.label,
  }));

  const listings = filterAndSort(allListings, params);

  return (
    <div className="container-site py-10">
      <Breadcrumbs items={[{ label: 'Shop' }]} />

      <div className="mb-8">
        <h1 className="section-heading">Shop</h1>
        <p className="section-subheading">
          {listings.length} product{listings.length !== 1 ? 's' : ''} — handcrafted 3D prints and laser engravings
        </p>
      </div>

      <Suspense fallback={null}>
        <ShopFilters tags={tags} materials={materials} categories={categories} />
      </Suspense>

      <div className="mt-8">
        <ProductGrid listings={listings} />
      </div>
    </div>
  );
}
