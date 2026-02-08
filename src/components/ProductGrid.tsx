import { NormalizedListing } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  listings: NormalizedListing[];
  priorityCount?: number;
}

export function ProductGrid({ listings, priorityCount = 4 }: ProductGridProps) {
  if (listings.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-salt-500 text-lg">No products found.</p>
        <p className="text-salt-400 mt-1 text-sm">Check back soon for new items!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing, i) => (
        <ProductCard key={listing.id} listing={listing} priority={i < priorityCount} />
      ))}
    </div>
  );
}
