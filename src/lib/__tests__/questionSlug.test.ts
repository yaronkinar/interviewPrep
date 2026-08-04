import {
  buildQuestionRoutes,
  categoryFromSlug,
  categorySlug,
  findQuestionRoute,
  questionPathById,
  slugify,
} from '@/lib/questionSlug'
import type { Question } from '@/questions/data'

function question(overrides: Partial<Question> & Pick<Question, 'id' | 'title'>): Question {
  return {
    companies: [],
    difficulty: 'medium',
    category: 'Closures & Scope',
    description: '',
    answer: '',
    answerType: 'text',
    tags: [],
    ...overrides,
  }
}

describe('slugify', () => {
  it('strips punctuation and lowercases', () => {
    expect(slugify('Implement debounce(fn, delay)')).toBe('implement-debounce-fn-delay')
  })

  it('collapses separators and trims edges', () => {
    expect(slugify('  ES6+ / Spread &  Rest  ')).toBe('es6-spread-rest')
  })

  it('returns an empty string when nothing survives', () => {
    expect(slugify('???')).toBe('')
  })
})

describe('category slugs', () => {
  it('round-trips every known category', () => {
    expect(categoryFromSlug(categorySlug('Closures & Scope'))).toBe('Closures & Scope')
    expect(categoryFromSlug(categorySlug('Async & Promises'))).toBe('Async & Promises')
    expect(categoryFromSlug(categorySlug('ES6+'))).toBe('ES6+')
  })

  it('rejects unknown slugs', () => {
    expect(categoryFromSlug('not-a-category')).toBeNull()
  })
})

describe('buildQuestionRoutes', () => {
  it('builds a category/title path', () => {
    const routes = buildQuestionRoutes([
      question({ id: 'debounce', title: 'Implement debounce(fn, delay)' }),
    ])
    expect(routes[0].path).toBe('/questions/closures-scope/implement-debounce-fn-delay')
  })

  it('disambiguates duplicate titles in the same category with the id', () => {
    const routes = buildQuestionRoutes([
      question({ id: 'b-second', title: 'Same Title' }),
      question({ id: 'a-first', title: 'Same Title' }),
    ])
    const paths = routes.map(r => r.path).sort()
    expect(paths).toEqual([
      '/questions/closures-scope/same-title',
      '/questions/closures-scope/same-title-b-second',
    ])
  })

  it('does not disambiguate identical titles across different categories', () => {
    const routes = buildQuestionRoutes([
      question({ id: 'a', title: 'Same Title', category: 'Closures & Scope' }),
      question({ id: 'b', title: 'Same Title', category: 'Algorithms' }),
    ])
    expect(routes.map(r => r.slug)).toEqual(['same-title', 'same-title'])
  })

  it('falls back to the id when the title has no usable characters', () => {
    const routes = buildQuestionRoutes([question({ id: 'edge-case', title: '???' })])
    expect(routes[0].slug).toBe('edge-case')
  })

  it('is stable regardless of input ordering', () => {
    const a = question({ id: 'b-second', title: 'Same Title' })
    const b = question({ id: 'a-first', title: 'Same Title' })
    const forward = buildQuestionRoutes([a, b]).map(r => `${r.question.id}:${r.slug}`)
    const reversed = buildQuestionRoutes([b, a]).map(r => `${r.question.id}:${r.slug}`)
    expect(forward).toEqual(reversed)
  })
})

describe('findQuestionRoute', () => {
  const catalog = [
    question({ id: 'debounce', title: 'Implement debounce(fn, delay)' }),
    question({ id: 'two-sum', title: 'Two Sum', category: 'Algorithms' }),
  ]

  it('resolves a known path back to its question', () => {
    const route = findQuestionRoute(catalog, 'algorithms', 'two-sum')
    expect(route?.question.id).toBe('two-sum')
  })

  it('returns null when the category does not match the question', () => {
    expect(findQuestionRoute(catalog, 'closures-scope', 'two-sum')).toBeNull()
  })

  it('returns null for unknown slugs', () => {
    expect(findQuestionRoute(catalog, 'algorithms', 'nope')).toBeNull()
  })
})

describe('questionPathById', () => {
  it('produces links matching what the route resolver accepts', () => {
    const catalog = [
      question({ id: 'b-second', title: 'Same Title' }),
      question({ id: 'a-first', title: 'Same Title' }),
    ]
    for (const [id, path] of questionPathById(catalog)) {
      const [, , categoryParam, slugParam] = path.split('/')
      expect(findQuestionRoute(catalog, categoryParam, slugParam)?.question.id).toBe(id)
    }
  })
})
