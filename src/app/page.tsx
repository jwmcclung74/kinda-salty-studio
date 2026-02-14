import Link from 'next/link';
import { getListingsByCategory, getFeaturedListings } from '@/lib/listings';
import { ProductGrid } from '@/components/ProductGrid';
import { EmailSignup } from '@/components/EmailSignup';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';

export const revalidate = 21600; // 6 hours

export default async function HomePage() {
  const prints = await getListingsByCategory('3d-prints');
  const laser = await getListingsByCategory('laser-engraving');
  const featuredListings = await getFeaturedListings();

  const featuredProducts = featuredListings.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    image: { url: l.images[0]?.url || '/images/placeholder-product.svg', alt: l.images[0]?.alt || l.title },
  }));

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-salt-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-salt-950 via-salt-900 to-salt-700" />
        {/* Decorative diagonal orange accent */}
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rotate-45 bg-accent/5 rounded-3xl" />
        <div className="absolute -left-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-accent/[0.03]" />
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="container-site relative py-24 sm:py-32 lg:py-40">
          <div className={`${featuredProducts.length > 0 ? 'grid lg:grid-cols-2 gap-12 items-center' : ''}`}>
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-4">
                Handcrafted with precision
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display leading-[1.1] tracking-tight">
                3D Prints &<br />
                Laser Engravings<br />
                <span className="text-accent">Made to Last</span>
              </h1>
              <p className="mt-6 text-lg text-salt-300 max-w-xl leading-relaxed">
                Unique designs crafted from digital precision — functional prints, custom engravings, and personalized gifts made by hand in small batches.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/shop" className="btn-primary">
                  Browse All Products
                </Link>
                <Link href="/custom-orders" className="inline-flex items-center gap-2 rounded border-2 border-white/20 px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-all hover:border-accent hover:bg-accent/10 hover:text-accent">
                  Custom Orders
                </Link>
              </div>
            </div>

            {/* Featured Products Carousel */}
            {featuredProducts.length > 0 && (
              <div className="mt-10 lg:mt-0">
                <FeaturedCarousel products={featuredProducts} />
              </div>
            )}
          </div>
        </div>
        {/* Bottom orange accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
      </section>

      {/* ── Category Cards ── */}
      <section className="container-site py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/3d-prints" className="group relative overflow-hidden rounded bg-salt-100 p-8 sm:p-12 transition-all hover:bg-salt-200 border border-salt-200 hover:border-accent/30">
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Explore</p>
              <h2 className="text-2xl sm:text-3xl font-display">3D Prints</h2>
              <p className="mt-2 text-salt-600 max-w-sm">
                Figurines, planters, desk toys, and functional prints — all designed and printed in-house.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-salt-700 group-hover:text-accent transition-colors">
                View Collection →
              </span>
            </div>
            <div className="absolute -right-8 -bottom-8 text-salt-200 group-hover:text-accent/20 transition-colors">
              <svg className="h-48 w-48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.5}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </Link>

          <Link href="/laser-engraving" className="group relative overflow-hidden rounded bg-salt-700 text-white p-8 sm:p-12 transition-all hover:bg-salt-800 border border-salt-600 hover:border-accent/40">
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Explore</p>
              <h2 className="text-2xl sm:text-3xl font-display">Laser Engraving</h2>
              <p className="mt-2 text-salt-300 max-w-sm">
                Signs, coasters, ornaments, and personalized gifts — precision cut and engraved.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:text-accent transition-colors">
                View Collection →
              </span>
            </div>
            <div className="absolute -right-8 -bottom-8 text-salt-600 group-hover:text-accent/20 transition-colors">
              <svg className="h-48 w-48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.5}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Quick Category Previews ── */}
      {prints.length > 0 && (
        <section className="container-site pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-heading">3D Prints</h2>
              <p className="section-subheading">Designed and printed in-house</p>
            </div>
            <Link href="/3d-prints" className="text-sm font-semibold text-salt-500 hover:text-accent transition-colors hidden sm:inline-flex items-center gap-1">
              See All →
            </Link>
          </div>
          <ProductGrid listings={prints.slice(0, 4)} />
        </section>
      )}

      {laser.length > 0 && (
        <section className="container-site pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-heading">Laser Engraved</h2>
              <p className="section-subheading">Precision cut, beautifully finished</p>
            </div>
            <Link href="/laser-engraving" className="text-sm font-semibold text-salt-500 hover:text-accent transition-colors hidden sm:inline-flex items-center gap-1">
              See All →
            </Link>
          </div>
          <ProductGrid listings={laser.slice(0, 4)} />
        </section>
      )}

      {/* ── About Teaser ── */}
      <section className="bg-salt-700 text-white">
        <div className="container-site py-20 text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">About the Maker</p>
          <h2 className="section-heading">Kinda Salty Studio</h2>
          <p className="mt-4 text-salt-300 leading-relaxed text-lg">
            A small-batch maker studio specializing in 3D printed models and laser engraved goods.
            Every piece is designed, printed, cut, and finished by hand — because the details matter.
          </p>
          <Link href="/about" className="inline-flex items-center justify-center gap-2 rounded border-2 border-accent px-6 py-3 text-sm font-semibold tracking-wide text-accent uppercase transition-all hover:bg-accent hover:text-white mt-8">
            Our Story
          </Link>
        </div>
      </section>

      {/* ── Email Signup CTA ── */}
      <section className="container-site py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">Stay in the Loop</h2>
          <p className="section-subheading mx-auto">
            Be the first to know about new products, limited drops, and studio updates.
          </p>
          <div className="mt-8 flex justify-center">
            <EmailSignup source="homepage" />
          </div>
        </div>
      </section>
    </>
  );
}
