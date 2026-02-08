import { MetadataRoute } from 'next';
import { getListings } from '@/lib/listings';
import { siteConfig } from '@/lib/site.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getListings();
  const base = siteConfig.url;

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/3d-prints`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/laser-engraving`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/custom-orders`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...listings.map((l) => ({
      url: `${base}/shop/${l.slug}`,
      lastModified: new Date(l.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
