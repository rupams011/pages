import { MetadataRoute } from 'next';


const BASE_URL = 'https://www.huesurge.com'; // Replace with your actual domain

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/'], // Add any private routes here
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
