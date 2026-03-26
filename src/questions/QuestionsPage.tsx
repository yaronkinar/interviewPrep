import { useState, useMemo } from 'react'
import { QUESTIONS, COMPANIES, type Question, type Difficulty, type Category } from './data'
import { CodeBlock } from '../components/CodeBlock'
import { QuestionExample, hasQuestionExample } from './QuestionExample'

const CATEGORIES: Category[] = [
  'Closures & Scope',
  'Async & Promises',
  'Prototypes & OOP',
  'DOM & Browser',
  'ES6+',
  'Algorithms',
  'System Design',
  'Performance',
]

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy:   '#34d399',
  medium: '#fbbf24',
  hard:   '#f87171',
}

function CompanyBadge({ name }: { name: string }) {
  const company = COMPANIES.find(c => c.id === name)
  return (
    <span className="company-badge" title={name}
      style={{ '--company-color': company?.color } as React.CSSProperties}>
      {name}
    </span>
  )
}

function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const canShowExample = hasQuestionExample(q.id)

  return (
    <div className="q-card">
      <div className="q-card-meta">
        <div className="q-companies">
          {q.companies.map(c => <CompanyBadge key={c} name={c} />)}
        </div>
        <span className="q-difficulty" style={{ color: DIFFICULTY_COLOR[q.difficulty] }}>
          {q.difficulty}
        </span>
      </div>

      <div className="q-category-label">{q.category}</div>
      <div className="q-title">{q.title}</div>
      <p className="q-desc">{q.description}</p>

      <div className="q-tags">
        {q.tags.map(t => <span key={t} className="q-tag">#{t}</span>)}
      </div>

      <button className="code-toggle" onClick={() => setOpen(o => !o)}>
        💡 {open ? 'Hide' : 'Show'} answer
      </button>

      {canShowExample && (
        <button className="code-toggle" onClick={() => setShowExample((v) => !v)}>
          🧪 {showExample ? 'Hide' : 'Show'} UI example
        </button>
      )}

      {showExample && (
        <QuestionExample questionId={q.id} />
      )}

      {open && (
        <div>
          <CodeBlock code={q.answer} language="javascript" />
          {q.source && (
            <div className="q-source">source: {q.source}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function QuestionsPage() {
  const [search, setSearch] = useState('')
  const [company, setCompany] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [category, setCategory] = useState<Category | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return QUESTIONS.filter(question => {
      if (company && !question.companies.includes(company)) return false
      if (difficulty && question.difficulty !== difficulty) return false
      if (category && question.category !== category) return false
      if (q && !question.title.toLowerCase().includes(q) &&
               !question.description.toLowerCase().includes(q) &&
               !question.tags.some(t => t.includes(q))) return false
      return true
    })
  }, [search, company, difficulty, category])

  function clearFilters() {
    setSearch('')
    setCompany(null)
    setDifficulty(null)
    setCategory(null)
  }

  const hasFilters = search || company || difficulty || category

  return (
    <>
      <h1 className="page-title">Company Interview Questions</h1>
      <section className="solve-guide">
        <div className="solve-guide-title">How to solve questions</div>
        <ol className="solve-guide-list">
          <li>Clarify requirements and constraints before coding.</li>
          <li>List edge cases and expected behavior for each one.</li>
          <li>Choose a baseline approach, then optimize if needed.</li>
          <li>Explain complexity in big-O terms for time and space.</li>
          <li>Implement in small steps and narrate decisions out loud.</li>
          <li>Validate with quick examples, then mention follow-ups.</li>
        </ol>
      </section>

      {/* ── SEARCH ── */}
      <div className="q-search-wrap">
        <input
          type="text"
          placeholder="Search questions, topics, tags…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="q-search"
        />
        {hasFilters && (
          <button className="secondary" onClick={clearFilters}>✕ Clear filters</button>
        )}
        <span className="q-count">{filtered.length} / {QUESTIONS.length} questions</span>
      </div>

      {/* ── COMPANY FILTER ── */}
      <div className="q-filter-row">
        <span className="q-filter-label">Company</span>
        <div className="q-filter-chips">
          {COMPANIES.map(c => {
            const count = QUESTIONS.filter(q => q.companies.includes(c.id)).length
            return (
              <button
                key={c.id}
                className={`q-chip${company === c.id ? ' active' : ''}`}
                style={{ '--chip-color': c.color } as React.CSSProperties}
                onClick={() => setCompany(company === c.id ? null : c.id)}
              >
                {c.emoji} {c.id}
                <span className="q-chip-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── DIFFICULTY + CATEGORY FILTER ── */}
      <div className="q-filter-row">
        <span className="q-filter-label">Difficulty</span>
        <div className="q-filter-chips">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              className={`q-chip${difficulty === d ? ' active' : ''}`}
              style={{ '--chip-color': DIFFICULTY_COLOR[d] } as React.CSSProperties}
              onClick={() => setDifficulty(difficulty === d ? null : d)}
            >
              {d}
              <span className="q-chip-count">
                {QUESTIONS.filter(q => q.difficulty === d).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="q-filter-row">
        <span className="q-filter-label">Category</span>
        <div className="q-filter-chips">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`q-chip${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(category === cat ? null : cat)}
            >
              {cat}
              <span className="q-chip-count">
                {QUESTIONS.filter(q => q.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULTS ── */}
      {filtered.length === 0 ? (
        <div className="q-empty">No questions match the current filters.</div>
      ) : (
        <div className="q-grid">
          {filtered.map(q => <QuestionCard key={q.id} q={q} />)}
        </div>
      )}
    </>
  )
}
