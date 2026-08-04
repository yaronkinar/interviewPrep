import { CATEGORIES, type Category, type Question } from '@/questions/data'

/** Lowercase, ASCII-safe URL segment: `Implement debounce(fn, delay)` → `implement-debounce-fn-delay`. */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function categorySlug(category: Category): string {
  return slugify(category)
}

const CATEGORY_BY_SLUG = new Map<string, Category>(
  CATEGORIES.map(category => [categorySlug(category), category]),
)

export function categoryFromSlug(slug: string): Category | null {
  return CATEGORY_BY_SLUG.get(slug) ?? null
}

export type QuestionRoute = {
  question: Question
  categorySlug: string
  slug: string
  path: string
}

/**
 * Assign one stable URL per question.
 *
 * Slugs come from the title so the URL carries the search terms. Two questions in
 * the same category that slugify identically are disambiguated by appending the
 * question id, which is unique — sorted by id first so the result does not depend
 * on catalog ordering.
 */
export function buildQuestionRoutes(questions: Question[]): QuestionRoute[] {
  const taken = new Set<string>()

  return [...questions]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(question => {
      const categoryPart = categorySlug(question.category)
      const base = slugify(question.title) || slugify(question.id) || 'question'
      const key = `${categoryPart}/${base}`
      const slug = taken.has(key) ? `${base}-${slugify(question.id)}` : base
      taken.add(key)

      return {
        question,
        categorySlug: categoryPart,
        slug,
        path: `/questions/${categoryPart}/${slug}`,
      }
    })
}

/**
 * Question id → canonical path, so list views link to exactly the URL the route
 * resolves. Derived from the same routing pass to keep collisions consistent.
 */
export function questionPathById(questions: Question[]): Map<string, string> {
  return new Map(buildQuestionRoutes(questions).map(route => [route.question.id, route.path]))
}

/** Resolve a `[category]/[slug]` pair back to its question, or `null` when unknown. */
export function findQuestionRoute(
  questions: Question[],
  categoryParam: string,
  slugParam: string,
): QuestionRoute | null {
  return (
    buildQuestionRoutes(questions).find(
      route => route.categorySlug === categoryParam && route.slug === slugParam,
    ) ?? null
  )
}
