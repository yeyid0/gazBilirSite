import vehiclesData from '@/data/vehicles.json';
import { SITE_CONFIG } from '@/lib/constants';

export default function sitemap() {
  const base = SITE_CONFIG.url;
  const now = new Date();

  const staticRoutes = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/hesapla`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/karsilastir`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/asistan`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const brandRoutes = Object.keys(vehiclesData.brands).map((slug) => ({
    url: `${base}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...brandRoutes];
}
