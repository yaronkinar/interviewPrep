import { useCallback, useMemo, useState } from 'react'
import {
  QUESTIONS,
  COMPANIES,
  CATEGORIES,
  type Question,
  type Difficulty,
  type Category,
} from './data'
import { CodeBlock } from '../components/CodeBlock'
import { QuestionExample, hasQuestionExample } from './QuestionExample'
import ApiKeySettings from './ApiKeySettings'
import OpenChat from './OpenChat'
import QuestionChat from './QuestionChat'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import {
  loadCustomQuestionsFromStorage,
  saveCustomQuestionsToStorage,
  parseQuestionsJson,
} from './customQuestions'
import { DEFAULT_ANTHROPIC_MODEL } from './anthropicConstants'

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#34d399',
  medium: '#fbbf24',
  hard: '#f87171',
}

function buildThinkingSteps(q: Question, baseSteps: string[]): string[] {
  const firstTag = q.tags[0] ?? 'core concept'
  const [step1, step2, step3, step4, step5] = baseSteps
  return [
    `${step1} (${q.category})`,
    `${step2} (${firstTag})`,
    step3,
    step4,
    step5,
  ]
}

function CompanyBadge({ name }: { name: string }) {
  const company = COMPANIES.find((c) => c.id === name)
  return (
    <span
      className="company-badge"
      title={name}
      style={{ '--company-color': company?.color } as React.CSSProperties}
    >
      {name}
    </span>
  )
}

interface QuestionCardProps {
  q: Question
  apiKey: string
  model: string
  isCustom: boolean
  ui: ReturnType<typeof getUiStrings>
  onDeleteCustom?: () => void
}

function QuestionCard({ q, apiKey, model, isCustom, ui, onDeleteCustom }: QuestionCardProps) {
  const [open, setOpen] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const canShowExample = hasQuestionExample(q.id)

  return (
    <div className="q-card">
      <div className="q-card-meta">
        <div className="q-companies">
          {q.companies.length > 0 ? (
            q.companies.map((c) => <CompanyBadge key={c} name={c} />)
          ) : (
            <span className="q-custom-badge">{ui.questions.customBadge}</span>
          )}
        </div>
        <span className="q-difficulty" style={{ color: DIFFICULTY_COLOR[q.difficulty] }}>
          {q.difficulty}
        </span>
      </div>

      <div className="q-category-label">{q.category}</div>
      <div className="q-title">{q.title}</div>
      <p className="q-desc">{q.description}</p>

      <div className="q-tags">
        {q.tags.map((t) => (
          <span key={t} className="q-tag">
            #{t}
          </span>
        ))}
      </div>

      <div className="explanation" style={{ marginBottom: '0.75rem' }}>
        <div className="explanation-title">{ui.questions.explanationTitle}</div>
        <div className="step" style={{ marginTop: 6 }}>
          <span>{q.description}</span>
        </div>
        <p className="q-explain-claude-hint">
          {ui.questions.explainHint}
        </p>
      </div>
      <button className="code-toggle" onClick={() => setShowThinking((v) => !v)}>
        🧠 {showThinking ? ui.common.hide : ui.common.show} {ui.questions.toggleThinking}
      </button>
      {showThinking && (
        <div className="explanation" style={{ marginBottom: '0.75rem' }}>
          <div className="explanation-title">{ui.questions.thinkingTitle}</div>
          {buildThinkingSteps(q, ui.questions.solveGuideSteps.slice(0, 5)).map((step, i) => (
            <div key={i} className="step">
              <span className="step-num">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}

      <button className="code-toggle" onClick={() => setOpen((o) => !o)}>
        💡 {open ? ui.common.hide : ui.common.show} {ui.questions.toggleAnswer}
      </button>

      {canShowExample && (
        <button className="code-toggle" onClick={() => setShowExample((v) => !v)}>
          🧪 {showExample ? ui.common.hide : ui.common.show} {ui.questions.toggleExample}
        </button>
      )}

      {showExample && <QuestionExample questionId={q.id} />}

      <QuestionChat question={q} apiKey={apiKey} model={model} />

      {isCustom && onDeleteCustom && (
        <button type="button" className="secondary q-custom-delete" onClick={onDeleteCustom}>
          {ui.questions.removeCustomQuestion}
        </button>
      )}

      {open && (
        <div>
          <CodeBlock code={q.answer} language="javascript" />
          {q.source && <div className="q-source">{ui.questions.source}: {q.source}</div>}
        </div>
      )}
    </div>
  )
}

export default function QuestionsPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const [search, setSearch] = useState('')
  const [company, setCompany] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [category, setCategory] = useState<Category | null>(null)

  const [customQuestions, setCustomQuestions] = useState<Question[]>(() =>
    loadCustomQuestionsFromStorage(),
  )
  const [uploadPaste, setUploadPaste] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [apiKey, setApiKey] = useState('')
  const [anthropicModel, setAnthropicModel] = useState(DEFAULT_ANTHROPIC_MODEL)

  const onCredentialsChange = useCallback((key: string, model: string) => {
    setApiKey(key)
    setAnthropicModel(model || DEFAULT_ANTHROPIC_MODEL)
  }, [])

  const customIds = useMemo(() => new Set(customQuestions.map((q) => q.id)), [customQuestions])

  const allQuestions = useMemo(() => [...QUESTIONS, ...customQuestions], [customQuestions])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allQuestions.filter((question) => {
      if (company && !question.companies.includes(company)) return false
      if (difficulty && question.difficulty !== difficulty) return false
      if (category && question.category !== category) return false
      if (
        q &&
        !question.title.toLowerCase().includes(q) &&
        !question.description.toLowerCase().includes(q) &&
        !question.tags.some((t) => t.includes(q))
      )
        return false
      return true
    })
  }, [search, company, difficulty, category, allQuestions])

  function clearFilters() {
    setSearch('')
    setCompany(null)
    setDifficulty(null)
    setCategory(null)
  }

  function mergeUploaded(questions: Question[]) {
    setCustomQuestions((prev) => {
      const next = [...prev, ...questions]
      saveCustomQuestionsToStorage(next)
      return next
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const result = parseQuestionsJson(text)
      if (!result.ok) {
        setUploadError(result.error)
        return
      }
      setUploadError(null)
      mergeUploaded(result.questions)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handlePasteUpload() {
    const result = parseQuestionsJson(uploadPaste.trim())
    if (!result.ok) {
      setUploadError(result.error)
      return
    }
    setUploadError(null)
    mergeUploaded(result.questions)
    setUploadPaste('')
  }

  function clearCustomQuestions() {
    setCustomQuestions([])
    saveCustomQuestionsToStorage([])
    setUploadError(null)
  }

  function removeCustomQuestion(id: string) {
    setCustomQuestions((prev) => {
      const next = prev.filter((q) => q.id !== id)
      saveCustomQuestionsToStorage(next)
      return next
    })
  }

  const hasFilters = search || company || difficulty || category

  return (
    <>
      <h1 className="page-title">{ui.pages.questionsTitle}</h1>

      <ApiKeySettings onCredentialsChange={onCredentialsChange} />

      <OpenChat apiKey={apiKey} model={anthropicModel} />

      <section className="q-upload-section">
        <div className="q-upload-title">{ui.questions.customQuestionsTitle}</div>
        <p className="q-upload-hint">
          {ui.questions.customQuestionsHint}
        </p>
        <div className="q-upload-row">
          <label className="q-upload-file-label">
            <span className="secondary">{ui.questions.chooseJsonFile}</span>
            <input type="file" accept="application/json,.json" className="q-upload-file" onChange={handleFileChange} />
          </label>
          {customQuestions.length > 0 && (
            <button type="button" className="secondary" onClick={clearCustomQuestions}>
              {ui.questions.removeAllCustom} ({customQuestions.length})
            </button>
          )}
        </div>
        <textarea
          className="q-upload-textarea"
          placeholder='Paste JSON, e.g. {"title":"...","description":"...","answer":"","tags":[]}'
          value={uploadPaste}
          onChange={(e) => setUploadPaste(e.target.value)}
          rows={4}
        />
        <button type="button" className="secondary" onClick={handlePasteUpload} disabled={!uploadPaste.trim()}>
          {ui.questions.addFromPaste}
        </button>
        {uploadError && <div className="q-upload-error">{uploadError}</div>}
      </section>

      <section className="solve-guide">
        <div className="solve-guide-title">{ui.questions.solveGuideTitle}</div>
        <ol className="solve-guide-list">
          {ui.questions.solveGuideSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="q-search-wrap">
        <input
          type="text"
          placeholder={ui.questions.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="q-search"
        />
        {hasFilters && (
          <button className="secondary" onClick={clearFilters}>
            ✕ {ui.questions.clearFilters}
          </button>
        )}
        <span className="q-count">
          {filtered.length} / {allQuestions.length} {ui.questions.questionsCountSuffix}
          {customQuestions.length > 0 && (
            <span className="q-count-custom"> ({customQuestions.length} {ui.questions.customCountSuffix})</span>
          )}
        </span>
      </div>

      <div className="q-filter-row">
        <span className="q-filter-label">{ui.questions.company}</span>
        <div className="q-filter-chips">
          {COMPANIES.map((c) => {
            const count = allQuestions.filter((q) => q.companies.includes(c.id)).length
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

      <div className="q-filter-row">
        <span className="q-filter-label">{ui.questions.difficulty}</span>
        <div className="q-filter-chips">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              className={`q-chip${difficulty === d ? ' active' : ''}`}
              style={{ '--chip-color': DIFFICULTY_COLOR[d] } as React.CSSProperties}
              onClick={() => setDifficulty(difficulty === d ? null : d)}
            >
              {d}
              <span className="q-chip-count">{allQuestions.filter((q) => q.difficulty === d).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="q-filter-row">
        <span className="q-filter-label">{ui.questions.category}</span>
        <div className="q-filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`q-chip${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(category === cat ? null : cat)}
            >
              {cat}
              <span className="q-chip-count">{allQuestions.filter((q) => q.category === cat).length}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="q-empty">{ui.questions.emptyState}</div>
      ) : (
        <div className="q-grid">
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              apiKey={apiKey}
              model={anthropicModel}
              isCustom={customIds.has(q.id)}
              ui={ui}
              onDeleteCustom={
                customIds.has(q.id) ? () => removeCustomQuestion(q.id) : undefined
              }
            />
          ))}
        </div>
      )}
    </>
  )
}
