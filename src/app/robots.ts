import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/schema';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/jobs/', '/category/', '/search', '/feed.xml'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/feed.xml`],
    host: baseUrl,
  };
}
