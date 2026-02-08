import type { Metadata } from 'next';
import { getListingsByCategory } from '@/lib/listings';
import { siteConfig } from '@/lib/site.config';
import { ProductGrid } from '@/components/ProductGrid';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const revalidate = 21600;
const cat = siteConfig.categories['laser-engraving'];

export const metadata: Metadata = {
  title: cat.label,
  description: cat.description,
  alternates: { canonical: `${siteConfig.url}/laser-engraving` },
};

export default async function LaserEngravingPage() {
  const listings = await getListingsByCategory('laser-engraving');
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
