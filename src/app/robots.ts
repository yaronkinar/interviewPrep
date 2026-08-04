import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  // Preview deployments serve the same content on a throwaway host; letting them
  // be crawled would compete with production as duplicate content.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

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
