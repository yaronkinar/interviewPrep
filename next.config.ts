import type { NextConfig } from 'next'

/**
 * Canonical origin, used for canonical tags, the sitemap and JSON-LD.
 *
 * Order matters for SEO: `VERCEL_URL` is the *per-deployment* hostname and
 * changes on every deploy, so preferring it would point every canonical at a
 * URL that dies. `VERCEL_PROJECT_PRODUCTION_URL` is the project's stable
 * production domain and is the correct fallback; `VERCEL_URL` is kept last so
 * preview deployments still resolve to themselves.
 */
const siteUrl = (() => {
  const normalize = (value?: string) => {
    const trimmed = value?.trim().replace(/\/$/, '')
    if (!trimmed) return ''
    return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`
  }

  return (
    normalize(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalize(process.env.VERCEL_URL) ||
    'http://localhost:3000'
  )
})()

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  turbopack: {},
}

export default nextConfig
