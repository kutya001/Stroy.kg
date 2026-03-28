import type { MetadataRoute } from 'next';
import { getAllMockProducts } from '@/lib/mockDb';

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllMockProducts(true);

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `https://stroy.kg/product/${product.id}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://stroy.kg',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://stroy.kg/catalog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productEntries,
  ];
}
