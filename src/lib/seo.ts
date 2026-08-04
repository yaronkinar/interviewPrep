import type { Metadata } from 'next'

/** Absolute site origin, shared with `next.config.ts` via `NEXT_PUBLIC_SITE_URL`. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://interview-prep.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'Interview Prep'

const DEFAULT_OG_IMAGE = '/og-interview-prep-home.webp'

export type PageSeo = {
  /** Page title without the site-name suffix. */
  title: string
  description: string
  /** Root-relative path used for the canonical URL, e.g. `/react`. */
  path: string
  /** Root-relative OG image path. Defaults to the home card. */
  image?: string
  /** Set for user-specific or thin pages that should stay out of the index. */
  noIndex?: boolean
}

/**
 * Build page metadata with a unique title, canonical URL and social cards.
 * Every indexable route should call this so pages stop competing as duplicates.
 */
export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: PageSeo): Metadata {
  const canonicalPath = path === '/' ? '/' : `/${path.replace(/^\/|\/$/g, '')}`
  const url = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`
  const fullTitle = path === '/' ? title : `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    alternates: { canonical: canonicalPath },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  }
}
