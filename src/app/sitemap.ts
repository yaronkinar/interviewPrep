import type { MetadataRoute } from 'next'
import { loadQuestionCatalog } from '@/lib/questionCatalog'
import { buildQuestionRoutes } from '@/lib/questionSlug'
import { SITE_URL } from '@/lib/seo'

/** Refreshed on the same cycle as the question pages so cron additions appear. */
export const revalidate = 3600

/** Indexable hub routes. Admin, API, auth and per-user pages are excluded by design. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/questions', priority: 0.9, changeFrequency: 'daily' },
  { path: '/js', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/react', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/typescript', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/vue', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/angular', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/css', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/fullstack', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/mock', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/cv', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/cv/themes', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/quest', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/sandbox', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.5, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries = STATIC_ROUTES.map(route => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const questionEntries = buildQuestionRoutes(await loadQuestionCatalog()).map(route => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: route.question.updatedAt ? new Date(route.question.updatedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...questionEntries]
}
