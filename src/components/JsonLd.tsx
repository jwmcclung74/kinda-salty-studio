import { siteConfig } from '@/lib/site.config';
import { NormalizedListing } from '@/lib/types';

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        description: siteConfig.description,
        sameAs: Object.values(siteConfig.social).filter(Boolean),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteConfig.url,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.url}/shop?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function ProductJsonLd({ listing }: { listing: NormalizedListing }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: listing.title,
        description: listing.description.slice(0, 500),
        image: listing.images.map((img) => img.url.startsWith('http') ? img.url : `${siteConfig.url}${img.url}`),
        url: `${siteConfig.url}/shop/${listing.slug}`,
        brand: {
          '@type': 'Brand',
          name: siteConfig.name,
        },
        offers: {
          '@type': 'Offer',
          url: listing.listingUrl,
          priceCurrency: listing.currency,
          price: listing.price,
          availability: listing.isAvailable
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: siteConfig.name,
          },
        },
        material: listing.materials.length > 0 ? listing.materials.join(', ') : undefined,
        category: listing.category,
      }}
    />
  );
}
