import Link from 'next/link'
import { loadQuestionCatalog } from '@/lib/questionCatalog'
import { buildQuestionRoutes } from '@/lib/questionSlug'
import type { Category } from '@/questions/data'

/**
 * Server-rendered index of every question, grouped by category.
 *
 * The interactive list above it is populated client-side, so without this the
 * per-question pages would have no crawlable inbound link anywhere on the site.
 */
export default async function QuestionIndex() {
  const routes = buildQuestionRoutes(await loadQuestionCatalog())

  if (routes.length === 0) return null

  const byCategory = new Map<Category, typeof routes>()
  for (const route of routes) {
    const bucket = byCategory.get(route.question.category)
    if (bucket) bucket.push(route)
    else byCategory.set(route.question.category, [route])
  }

  const categories = [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <section className="question-index">
      <h2 className="question-index-title">All interview questions</h2>
      {categories.map(([category, categoryRoutes]) => (
        <div key={category} className="question-index-group">
          <h3 className="question-index-category">{category}</h3>
          <ul className="question-index-list">
            {categoryRoutes
              .sort((a, b) => a.question.title.localeCompare(b.question.title))
              .map(route => (
                <li key={route.question.id}>
                  <Link href={route.path}>{route.question.title}</Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
