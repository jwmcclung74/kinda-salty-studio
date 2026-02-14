import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListings, getListingBySlug, getRelatedListings } from '@/lib/listings';
import { siteConfig } from '@/lib/site.config';
import { formatPrice, truncate } from '@/lib/utils';
import { Breadcrumbs, breadcrumbJsonLd } from '@/components/Breadcrumbs';
import { ProductJsonLd } from '@/components/JsonLd';
import { ProductGrid } from '@/components/ProductGrid';
import { EtsyButton } from '@/components/EtsyButton';

export const revalidate = 21600;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const listings = await getListings();
  return listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};

  const image = listing.images[0];
  return {
    title: listing.title,
    description: truncate(listing.description, 155),
    alternates: { canonical: `${siteConfig.url}/shop/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description: truncate(listing.description, 155),
      url: `${siteConfig.url}/shop/${listing.slug}`,
      images: image ? [{ url: image.url.startsWith('http') ? image.url : `${siteConfig.url}${image.url}`, width: image.width, height: image.height }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: truncate(listing.description, 155),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const related = await getRelatedListings(listing, 4);

  const categoryLabel =
    listing.category === '3d-prints' ? '3D Prints'
    : listing.category === 'laser-engraving' ? 'Laser Engraving'
    : 'Shop';
  const categoryHref =
    listing.category === '3d-prints' ? '/3d-prints'
    : listing.category === 'laser-engraving' ? '/laser-engraving'
    : '/shop';

  const breadcrumbs = [
    { label: 'Shop', href: '/shop' },
    { label: categoryLabel, href: categoryHref },
    { label: listing.title },
  ];

  return (
    <>
      <ProductJsonLd listing={listing} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs, siteConfig.url)) }}
      />

      <div className="container-site py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded bg-salt-100">
              <Image
                src={listing.images[0]?.url || '/images/placeholder-product.svg'}
                alt={listing.images[0]?.alt || listing.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {!listing.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-salt-700/60">
                  <span className="rounded bg-salt-700 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden bg-salt-100">
                    <Image src={img.url} alt={img.alt} fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <Link
              href={categoryHref}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-accent-dark transition-colors"
            >
              {categoryLabel}
            </Link>

            <h1 className="mt-3 text-3xl sm:text-4xl font-display tracking-tight leading-tight">
              {listing.title}
            </h1>

            <p className="mt-4 text-3xl font-display text-accent-dark">
              {formatPrice(listing.price, listing.currency)}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${listing.isAvailable ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-sm text-salt-600">
                {listing.isAvailable ? `In Stock (${listing.quantity} available)` : 'Currently Unavailable'}
              </span>
            </div>

            <div className="mt-8">
              <EtsyButton url={listing.listingUrl} title={listing.title} />
              <p className="mt-2 text-xs text-salt-400 text-center">Secure checkout on Etsy</p>
            </div>

            <div className="mt-10 border-t border-salt-200 pt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-salt-500 mb-3">Description</h2>
              <div className="text-salt-700 text-sm leading-relaxed whitespace-pre-line max-w-none">
                {listing.description}
              </div>
            </div>

            {listing.tags.length > 0 && (
              <div className="mt-8 border-t border-salt-200 pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-salt-500 mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/shop?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-salt-200 px-3 py-1 text-xs text-salt-600 transition-colors hover:border-accent hover:text-accent"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {listing.materials.length > 0 && (
              <div className="mt-6 border-t border-salt-200 pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-salt-500 mb-3">Materials</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.materials.map((mat) => (
                    <Link
                      key={mat}
                      href={`/shop?material=${encodeURIComponent(mat)}`}
                      className="rounded-full border border-salt-200 px-3 py-1 text-xs text-salt-600 transition-colors hover:border-accent hover:text-accent"
                    >
                      {mat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-salt-200 pt-12">
            <h2 className="section-heading mb-8">You Might Also Like</h2>
            <ProductGrid listings={related} />
          </section>
        )}
      </div>
    </>
  );
}
