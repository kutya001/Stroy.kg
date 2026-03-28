import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/profile', '/chats', '/create', '/add-product', '/dashboard'],
    },
    sitemap: 'https://stroy.kg/sitemap.xml',
  };
}
