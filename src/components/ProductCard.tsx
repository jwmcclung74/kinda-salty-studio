import Link from 'next/link';
import Image from 'next/image';
import { NormalizedListing } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { EtsyButton } from './EtsyButton';

interface ProductCardProps {
  listing: NormalizedListing;
  priority?: boolean;
}

export function ProductCard({ listing, priority = false }: ProductCardProps) {
  const image = listing.images[0];

  return (
    <article className="product-card group">
      <Link href={`/shop/${listing.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-salt-100">
          <Image
            src={image?.url || '/images/placeholder-product.svg'}
            alt={image?.alt || listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="product-card-image object-cover"
            priority={priority}
          />
          {!listing.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-salt-900/50">
              <span className="rounded-sm bg-salt-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                Sold Out
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="rounded-sm bg-salt-900/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {listing.category === '3d-prints' ? '3D Print' : listing.category === 'laser-engraving' ? 'Laser' : 'Shop'}
            </span>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-salt-900 line-clamp-2 group-hover:text-accent transition-colors">
            {listing.title}
          </h3>
          <p className="text-base font-display text-salt-900">
            {formatPrice(listing.price, listing.currency)}
          </p>
        </div>
      </Link>
      <div className="mt-2">
        <EtsyButton url={listing.listingUrl} title={listing.title} size="small" />
      </div>
    </article>
  );
}
