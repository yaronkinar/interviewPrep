import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from '@/components/CodeBlock'
import { loadQuestionCatalog } from '@/lib/questionCatalog'
import { buildQuestionRoutes, findQuestionRoute } from '@/lib/questionSlug'
import { buildMetadata } from '@/lib/seo'

/**
 * Questions change rarely, but a daily cron adds new ones. Hourly revalidation
 * plus on-demand rendering of unknown slugs means new questions get their own
 * page without waiting for a redeploy.
 */
export const revalidate = 3600

type RouteParams = { category: string; slug: string }

export async function generateStaticParams(): Promise<RouteParams[]> {
  const routes = buildQuestionRoutes(await loadQuestionCatalog())
  return routes.map(route => ({ category: route.categorySlug, slug: route.slug }))
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { category, slug } = await params
  const route = findQuestionRoute(await loadQuestionCatalog(), category, slug)

  if (!route) {
    return buildMetadata({
      title: 'Question not found',
      description: 'This interview question is no longer available.',
      path: `/questions/${category}/${slug}`,
      noIndex: true,
    })
  }

  const { question } = route
  const companies = question.companies.length ? ` Asked at ${question.companies.join(', ')}.` : ''

  return buildMetadata({
    title: `${question.title} — ${question.category} Interview Question`,
    description: `${question.description.slice(0, 150)}${companies}`.trim().slice(0, 300),
    path: route.path,
  })
}

export default async function QuestionPage({ params }: { params: Promise<RouteParams> }) {
  const { category, slug } = await params
  const route = findQuestionRoute(await loadQuestionCatalog(), category, slug)

  if (!route) notFound()

  const { question } = route

  return (
    <div className="editorial-page">
      <article className="editorial-panel">
        <nav className="q-breadcrumb" aria-label="Breadcrumb">
          <Link href="/questions" className="home-card-link">
            ← All interview questions
          </Link>
        </nav>

        <div className="q-editorial-badges" style={{ marginTop: '1rem' }}>
          <span className="q-editorial-badge q-editorial-badge--category">{question.category}</span>
          <span
            className={`q-editorial-badge q-editorial-badge--difficulty q-editorial-badge--difficulty-${question.difficulty}`}
          >
            {question.difficulty}
          </span>
        </div>

        <h1 className="screen-header-title" style={{ marginBlock: '0.75rem 1rem' }}>
          {question.title}
        </h1>

        <p className="q-desc q-desc--stitch">{question.description}</p>

        {question.companies.length > 0 && (
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
            Asked at {question.companies.join(', ')}
          </p>
        )}

        {question.tags.length > 0 && (
          <div className="q-tags q-tags--stitch" style={{ marginTop: '1rem' }}>
            {question.tags.map(tag => (
              <span key={tag} className="q-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <section style={{ marginTop: '2rem' }}>
          <h2 className="explanation-title">Answer</h2>
          {question.answerType === 'code' ? (
            <CodeBlock code={question.answer} language="javascript" />
          ) : (
            <div className="explanation explanation--stitch">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {question.answer}
              </ReactMarkdown>
            </div>
          )}
        </section>

        {question.source && <p className="q-source">Source: {question.source}</p>}

        <p style={{ marginTop: '2rem' }}>
          <Link href="/questions" className="home-card-link">
            Practise more {question.category} questions →
          </Link>
        </p>
      </article>
    </div>
  )
}
