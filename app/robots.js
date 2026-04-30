import { SITE_CONFIG } from '@/lib/constants';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
