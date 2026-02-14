import type { Metadata } from 'next';
import { getCuratedListingsByCategory } from '@/lib/listings';
import { siteConfig } from '@/lib/site.config';
import { ProductGrid } from '@/components/ProductGrid';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const revalidate = 21600;
const cat = siteConfig.categories['3d-prints'];

export const metadata: Metadata = {
  title: cat.label,
  description: cat.description,
  alternates: { canonical: `${siteConfig.url}/3d-prints` },
};

export default async function ThreeDPrintsPage() {
  const listings = await getCuratedListingsByCategory('3d-prints');
  return (
    <div className="container-site py-10">
      <Breadcrumbs items={[{ label: cat.label }]} />
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Collection</p>
        <h1 className="section-heading">{cat.label}</h1>
        <p className="section-subheading">{cat.description}</p>
      </div>
      <ProductGrid listings={listings} />
    </div>
  );
}
