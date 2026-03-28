import type { MetadataRoute } from 'next';
import { getAllMockProducts } from '@/lib/mockDb';
import { createClient } from '@/lib/supabase/server';
import { getAllProducts } from '@/lib/queries';

const USE_SUPABASE = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products;
  if (USE_SUPABASE) {
    const supabase = await createClient();
    products = await getAllProducts(supabase, true);
  } else {
    products = getAllMockProducts(true);
  }

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
