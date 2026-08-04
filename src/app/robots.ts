import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Internal tooling, endpoints and per-user pages — nothing to index.
      disallow: ['/admin', '/api/', '/saved', '/sign-in', '/sign-up'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
