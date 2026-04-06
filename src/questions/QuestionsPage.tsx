import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import ApiKeySettings, { type AiSettingsSnapshot } from './ApiKeySettings'
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
import { DEFAULT_GEMINI_MODEL } from './geminiConstants'
import { DEFAULT_OPENAI_MODEL } from './openaiConstants'
import ScreenHeader from '../components/layout/ScreenHeader'
import FilterRow from '../components/filters/FilterRow'
import FilterChip from '../components/filters/FilterChip'
import FilterSearchBar from '../components/filters/FilterSearchBar'

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
  llmProvider: AiSettingsSnapshot['provider']
  isCustom: boolean
  ui: ReturnType<typeof getUiStrings>
  onDeleteCustom?: () => void
}

interface QuestionCardBodyProps {
  q: Question
  apiKey: string
  model: string
  llmProvider: AiSettingsSnapshot['provider']
  isCustom: boolean
  ui: ReturnType<typeof getUiStrings>
  onDeleteCustom?: () => void
  open: boolean
  setOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  showThinking: boolean
  setShowThinking: (v: boolean | ((prev: boolean) => boolean)) => void
  showExample: boolean
  setShowExample: (v: boolean | ((prev: boolean) => boolean)) => void
}

function QuestionCardBody({
  q, apiKey, model, llmProvider, isCustom, ui, onDeleteCustom,
  open, setOpen, showThinking, setShowThinking, showExample, setShowExample,
}: QuestionCardBodyProps) {
  const canShowExample = hasQuestionExample(q.id)

  return (
    <>
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

      <QuestionChat question={q} apiKey={apiKey} model={model} llmProvider={llmProvider} />

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
    </>
  )
}

function QuestionCard({ q, apiKey, model, llmProvider, isCustom, ui, onDeleteCustom }: QuestionCardProps) {
  const [open, setOpen] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!expanded) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [expanded])

  const sharedProps = { q, apiKey, model, llmProvider, isCustom, ui, onDeleteCustom, open, setOpen, showThinking, setShowThinking, showExample, setShowExample }

  return (
    <>
      <div className="q-card">
        <button
          type="button"
          className="q-expand-btn"
          title="Expand to full width"
          onClick={() => setExpanded(true)}
          aria-label="Expand question"
        >
          ⤢
        </button>
        <QuestionCardBody {...sharedProps} />
      </div>

      {expanded && createPortal(
        <div
          className="q-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false) }}
          role="dialog"
          aria-modal="true"
          aria-label={q.title}
        >
          <div className="q-modal">
            <div className="q-modal-header">
              <span className="q-modal-title">{q.title}</span>
              <button
                ref={closeRef}
                type="button"
                className="q-modal-close"
                onClick={() => setExpanded(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="q-modal-body">
              <QuestionCardBody {...sharedProps} />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
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

  const [aiSettings, setAiSettings] = useState<AiSettingsSnapshot>(() => ({
    provider: 'anthropic',
    anthropicApiKey: '',
    anthropicModel: DEFAULT_ANTHROPIC_MODEL,
    geminiApiKey: '',
    geminiModel: DEFAULT_GEMINI_MODEL,
    openaiApiKey: '',
    openaiModel: DEFAULT_OPENAI_MODEL,
  }))

  const onAiSettingsChange = useCallback((s: AiSettingsSnapshot) => {
    setAiSettings(s)
  }, [])

  const chatApiKey =
    aiSettings.provider === 'gemini'
      ? aiSettings.geminiApiKey
      : aiSettings.provider === 'openai'
        ? aiSettings.openaiApiKey
        : aiSettings.anthropicApiKey
  const chatModel =
    aiSettings.provider === 'gemini'
      ? aiSettings.geminiModel
      : aiSettings.provider === 'openai'
        ? aiSettings.openaiModel
        : aiSettings.anthropicModel

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
    <div className="editorial-page editorial-page--questions">
      <ScreenHeader title={ui.pages.questionsTitle} />

      <section className="editorial-panel editorial-panel--tight">
        <ApiKeySettings onAiSettingsChange={onAiSettingsChange} />

        <OpenChat
          apiKey={chatApiKey}
          model={chatModel}
          llmProvider={aiSettings.provider}
        />
      </section>

      <section className="q-upload-section editorial-panel">
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

      <section className="solve-guide editorial-panel">
        <div className="solve-guide-title">{ui.questions.solveGuideTitle}</div>
        <ol className="solve-guide-list">
          {ui.questions.solveGuideSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="editorial-panel editorial-panel--tight">
        <FilterSearchBar
          placeholder={ui.questions.searchPlaceholder}
          value={search}
          onChange={setSearch}
          showClear={Boolean(hasFilters)}
          onClear={clearFilters}
          clearLabel={ui.questions.clearFilters}
          rightSlot={(
            <span className="q-count">
              {filtered.length} / {allQuestions.length} {ui.questions.questionsCountSuffix}
              {customQuestions.length > 0 && (
                <span className="q-count-custom"> ({customQuestions.length} {ui.questions.customCountSuffix})</span>
              )}
            </span>
          )}
        />

        <FilterRow label={ui.questions.company}>
          {COMPANIES.map((c) => {
            const count = allQuestions.filter((q) => q.companies.includes(c.id)).length
            return (
              <FilterChip
                key={c.id}
                active={company === c.id}
                style={{ '--chip-color': c.color } as React.CSSProperties}
                onClick={() => setCompany(company === c.id ? null : c.id)}
              >
                {c.emoji} {c.id}
                <span className="q-chip-count">{count}</span>
              </FilterChip>
            )
          })}
        </FilterRow>

        <FilterRow label={ui.questions.difficulty}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <FilterChip
              key={d}
              active={difficulty === d}
              style={{ '--chip-color': DIFFICULTY_COLOR[d] } as React.CSSProperties}
              onClick={() => setDifficulty(difficulty === d ? null : d)}
            >
              {d}
              <span className="q-chip-count">{allQuestions.filter((q) => q.difficulty === d).length}</span>
            </FilterChip>
          ))}
        </FilterRow>

        <FilterRow label={ui.questions.category}>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              active={category === cat}
              onClick={() => setCategory(category === cat ? null : cat)}
            >
              {cat}
              <span className="q-chip-count">{allQuestions.filter((q) => q.category === cat).length}</span>
            </FilterChip>
          ))}
        </FilterRow>
      </section>

      {filtered.length === 0 ? (
        <div className="q-empty">{ui.questions.emptyState}</div>
      ) : (
        <div className="q-grid">
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              apiKey={chatApiKey}
              model={chatModel}
              llmProvider={aiSettings.provider}
              isCustom={customIds.has(q.id)}
              ui={ui}
              onDeleteCustom={
                customIds.has(q.id) ? () => removeCustomQuestion(q.id) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
