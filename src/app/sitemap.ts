import { MetadataRoute } from 'next';


const BASE_URL = 'https://www.huesurge.com'; // Replace with your actual domain

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/privacy',
    '/terms',
    '/faq',
    '/contact',
    '/color',
    '/palette',
    '/gradient',
    '/create',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
