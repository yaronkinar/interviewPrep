import type { NextConfig } from 'next'

const siteUrl = (() => {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL
  const fromVercel = vercel ? `https://${vercel.replace(/^https?:\/\//, '')}` : ''
  return fromEnv || fromVercel || 'http://localhost:3000'
})()

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  turbopack: {},
}

export default nextConfig
