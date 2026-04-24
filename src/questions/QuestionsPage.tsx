import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  ListFilter,
  Maximize2,
  Share2,
  Terminal,
} from 'lucide-react'
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
import { DEFAULT_GEMINI_MODEL, readDefaultGeminiKeyFromEnv } from './geminiConstants'
import { DEFAULT_OPENAI_MODEL } from './openaiConstants'
import { useSavedQuestions } from '../hooks/useSavedQuestions'
import FilterSearchBar from '../components/filters/FilterSearchBar'
import { PATH_FOR_PAGE } from '../routes'

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#34d399',
  medium: '#fbbf24',
  hard: '#f87171',
}

const BOOKMARKS_KEY = 'q-bookmarks'

function readBookmarkIds(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeBookmarkIds(ids: string[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids))
}

/** Search query matches title, description, category, tags, and company names (all tokens must appear). */
function questionMatchesSearchQuery(question: Question, raw: string): boolean {
  const q = raw.toLowerCase().trim()
  if (!q) return true
  const tokens = q.split(/\s+/).filter(Boolean)
  const hay = [
    question.title,
    question.description,
    question.category,
    ...question.tags,
    ...question.companies,
  ]
    .join(' ')
    .toLowerCase()
  return tokens.every((t) => hay.includes(t))
}

function searchTokens(raw: string): string[] {
  const tokens = raw
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
  return [...new Set(tokens)].sort((a, b) => b.length - a.length)
}

/** Excerpt centered on the first query token match (description, else title / tags). */
function buildSearchSnippet(q: Question, rawQuery: string, radius = 88, maxTotal = 260): string {
  const tokens = searchTokens(rawQuery)
  const fallback = q.description.length > maxTotal ? `${q.description.slice(0, maxTotal)}…` : q.description
  if (!tokens.length) return fallback

  const trySlice = (source: string): string | null => {
    if (!source.trim()) return null
    const lower = source.toLowerCase()
    let bestIdx = -1
    let matchLen = 0
    for (const t of tokens) {
      const i = lower.indexOf(t)
      if (i >= 0 && (bestIdx < 0 || i < bestIdx)) {
        bestIdx = i
        matchLen = t.length
      }
    }
    if (bestIdx < 0) return null
    const start = Math.max(0, bestIdx - radius)
    const end = Math.min(source.length, bestIdx + matchLen + radius)
    let slice = source.slice(start, end).trim()
    if (start > 0) slice = `…${slice}`
    if (end < source.length) slice = `${slice}…`
    return slice.length > maxTotal ? `${slice.slice(0, maxTotal)}…` : slice
  }

  return trySlice(q.description) ?? trySlice(q.title) ?? trySlice(q.tags.join(' ')) ?? fallback
}

function highlightSearchMatches(text: string, rawQuery: string): ReactNode {
  const tokens = searchTokens(rawQuery)
  if (!tokens.length) return text
  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const re = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((part, i) => {
        const hit = tokens.some((t) => part.toLowerCase() === t)
        return hit ? (
          <mark key={i} className="q-search-hit">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      })}
    </>
  )
}

function difficultyStitchLabel(d: Difficulty, ui: ReturnType<typeof getUiStrings>): string {
  if (d === 'easy') return ui.questions.difficultyFoundational
  if (d === 'medium') return ui.questions.difficultyIntermediate
  return ui.questions.difficultyArchitectural
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
  /** When provided, overrides local-storage bookmark with server-backed state */
  serverBookmarked?: boolean
  onServerToggleBookmark?: () => void
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
  variant?: 'default' | 'editorial'
  bookmarked?: boolean
  onToggleBookmark?: () => void
  onShare?: () => void
  /** When set, editorial cards show a contextual excerpt instead of the full description. */
  searchQuery?: string
}

function QuestionCardBody({
  q, apiKey, model, llmProvider, isCustom, ui, onDeleteCustom,
  open, setOpen, showThinking, setShowThinking, showExample, setShowExample,
  variant = 'default',
  bookmarked = false,
  onToggleBookmark,
  onShare,
  searchQuery,
}: QuestionCardBodyProps) {
  const canShowExample = hasQuestionExample(q.id)
  const editorial = variant === 'editorial'
  const showFullChrome = !editorial || open

  if (editorial) {
    const diffClass =
      q.difficulty === 'hard'
        ? 'q-editorial-badge--difficulty-hard'
        : q.difficulty === 'medium'
          ? 'q-editorial-badge--difficulty-medium'
          : 'q-editorial-badge--difficulty-easy'

    return (
      <>
        <div className="q-stitch-card-head">
          <div className="q-stitch-card-head-main">
            <div className="q-editorial-badges">
              <span className="q-editorial-badge q-editorial-badge--category">{q.category}</span>
              <span className={`q-editorial-badge q-editorial-badge--difficulty ${diffClass}`}>
                {difficultyStitchLabel(q.difficulty, ui)}
              </span>
            </div>
            <h3 className="q-title q-title--stitch">{q.title}</h3>
          </div>
          <div className="q-stitch-company-block">
            <span className="q-stitch-company-label">{ui.questions.companyTagsLabel}</span>
            <div className="q-stitch-company-tags">
              {q.companies.length > 0 ? (
                q.companies.map((c) => <CompanyBadge key={c} name={c} />)
              ) : (
                <span className="q-stitch-company-fallback">{ui.questions.customBadge}</span>
              )}
            </div>
          </div>
        </div>

        {searchQuery?.trim() ? (
          <div className="q-stitch-preview-block">
            <p className="q-stitch-preview-kicker">{ui.questions.searchMatchPreviewLabel}</p>
            <p className="q-desc q-desc--stitch q-desc--search-preview">
              {highlightSearchMatches(buildSearchSnippet(q, searchQuery), searchQuery)}
            </p>
          </div>
        ) : (
          <p className="q-desc q-desc--stitch">{q.description}</p>
        )}

        <div className="q-stitch-panel q-stitch-panel--thinking">
          <button
            type="button"
            className="q-stitch-panel-toggle"
            onClick={() => setShowThinking((v) => !v)}
            aria-expanded={showThinking}
          >
            <span className="q-stitch-panel-toggle-left">
              <Brain className="q-stitch-panel-icon q-stitch-panel-icon--thinking" size={22} strokeWidth={2} aria-hidden />
              <span className="q-stitch-panel-label q-stitch-panel-label--thinking">
                {ui.questions.thinkingProcessLabel}
              </span>
            </span>
            {showThinking ? (
              <ChevronUp className="q-stitch-panel-chevron" size={22} strokeWidth={2} aria-hidden />
            ) : (
              <ChevronDown className="q-stitch-panel-chevron" size={22} strokeWidth={2} aria-hidden />
            )}
          </button>
          {showThinking && (
            <div className="q-stitch-panel-body q-stitch-panel-body--thinking">
              {buildThinkingSteps(q, ui.questions.solveGuideSteps.slice(0, 5)).map((step, i) => (
                <p key={i} className="q-stitch-thinking-step">
                  {i + 1}. {step}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="q-stitch-panel q-stitch-panel--explain">
          <button
            type="button"
            className="q-stitch-panel-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <span className="q-stitch-panel-toggle-left">
              <BookOpen className="q-stitch-panel-icon q-stitch-panel-icon--explain" size={22} strokeWidth={2} aria-hidden />
              <span className="q-stitch-panel-label q-stitch-panel-label--explain">
                {ui.questions.editorialExplanationLabel}
              </span>
            </span>
            {open ? (
              <ChevronUp className="q-stitch-panel-chevron" size={22} strokeWidth={2} aria-hidden />
            ) : (
              <ChevronDown className="q-stitch-panel-chevron" size={22} strokeWidth={2} aria-hidden />
            )}
          </button>
          {open && (
            <div className="q-stitch-panel-body q-stitch-panel-body--explain">
              <p className="q-explain-claude-hint q-explain-claude-hint--stitch">{ui.questions.explainHint}</p>
              <div className="q-tags q-tags--stitch">
                {q.tags.map((t) => (
                  <span key={t} className="q-tag">
                    #{t}
                  </span>
                ))}
              </div>
              <div className="explanation explanation--stitch">
                <div className="explanation-title">{ui.questions.explanationTitle}</div>
                <div className="step" style={{ marginTop: 6 }}>
                  <span>{q.description}</span>
                </div>
              </div>
              {canShowExample && (
                <button type="button" className="code-toggle code-toggle--stitch" onClick={() => setShowExample((v) => !v)}>
                  {showExample ? ui.common.hide : ui.common.show} {ui.questions.toggleExample}
                </button>
              )}
              {showExample && <QuestionExample questionId={q.id} />}
              <CodeBlock code={q.answer} language="javascript" />
              {q.source && (
                <div className="q-source">
                  {ui.questions.source}: {q.source}
                </div>
              )}
              <QuestionChat question={q} apiKey={apiKey} model={model} llmProvider={llmProvider} />
              {isCustom && onDeleteCustom && (
                <button type="button" className="secondary q-custom-delete" onClick={onDeleteCustom}>
                  {ui.questions.removeCustomQuestion}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="q-stitch-card-footer">
          <div className="q-stitch-card-footer-actions">
            {onToggleBookmark && (
              <button type="button" className="q-stitch-foot-btn" onClick={onToggleBookmark}>
                <Bookmark
                  className="q-stitch-foot-icon"
                  size={16}
                  strokeWidth={2}
                  aria-hidden
                  fill={bookmarked ? 'currentColor' : 'none'}
                />
                {bookmarked ? ui.questions.savedQuestion : ui.questions.saveQuestion}
              </button>
            )}
            {onShare && (
              <button type="button" className="q-stitch-foot-btn" onClick={onShare}>
                <Share2 className="q-stitch-foot-icon" size={16} strokeWidth={2} aria-hidden />
                {ui.questions.shareAnalysis}
              </button>
            )}
          </div>
          <button type="button" className="q-stitch-foot-docs" onClick={() => setOpen(true)}>
            {ui.questions.fullDocumentation}
            <ArrowRight className="q-stitch-foot-docs-arrow" size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </>
    )
  }

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

      {showFullChrome && (
      <div className="q-tags">
        {q.tags.map((t) => (
          <span key={t} className="q-tag">
            #{t}
          </span>
        ))}
      </div>
      )}

      {showFullChrome && (
        <>
          <div className="explanation" style={{ marginBottom: '0.75rem' }}>
            <div className="explanation-title">{ui.questions.explanationTitle}</div>
            <div className="step" style={{ marginTop: 6 }}>
              <span>{q.description}</span>
            </div>
            <p className="q-explain-claude-hint">
              {ui.questions.explainHint}
            </p>
          </div>
          <button type="button" className="code-toggle" onClick={() => setShowThinking((v) => !v)}>
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

          <button type="button" className="code-toggle" onClick={() => setOpen((o) => !o)}>
            💡 {open ? ui.common.hide : ui.common.show} {ui.questions.toggleAnswer}
          </button>

          {canShowExample && (
            <button type="button" className="code-toggle" onClick={() => setShowExample((v) => !v)}>
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
      )}
    </>
  )
}

interface QuestionCardWithEditorialProps extends QuestionCardProps {
  editorial?: boolean
  searchQuery?: string
  section?: string
}

function QuestionCard({
  q, apiKey, model, llmProvider, isCustom, ui, onDeleteCustom, editorial = false, searchQuery,
  serverBookmarked, onServerToggleBookmark,
}: QuestionCardWithEditorialProps) {
  const [open, setOpen] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [localBookmarked, setLocalBookmarked] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const hasServerBookmark = serverBookmarked !== undefined && onServerToggleBookmark !== undefined
  const bookmarked = hasServerBookmark ? serverBookmarked : localBookmarked

  useEffect(() => {
    if (!hasServerBookmark) {
      setLocalBookmarked(readBookmarkIds().includes(q.id))
    }
  }, [q.id, hasServerBookmark])

  const toggleBookmark = useCallback(() => {
    if (hasServerBookmark && onServerToggleBookmark) {
      onServerToggleBookmark()
      return
    }
    const next = readBookmarkIds()
    const has = next.includes(q.id)
    const merged = has ? next.filter((id) => id !== q.id) : [...next, q.id]
    writeBookmarkIds(merged)
    setLocalBookmarked(!has)
  }, [q.id, hasServerBookmark, onServerToggleBookmark])

  const shareQuestion = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: q.title, text: q.description, url })
      } else {
        await navigator.clipboard.writeText(`${q.title}\n${url}`)
      }
    } catch {
      /* dismissed or unsupported */
    }
  }, [q.title, q.description])

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

  const bodyVariant: 'default' | 'editorial' = expanded ? 'default' : editorial ? 'editorial' : 'default'
  const sharedProps = {
    q, apiKey, model, llmProvider, isCustom, ui, onDeleteCustom, open, setOpen,
    showThinking, setShowThinking, showExample, setShowExample, variant: bodyVariant,
    ...(editorial && !expanded
      ? { bookmarked, onToggleBookmark: toggleBookmark, onShare: shareQuestion, searchQuery }
      : {}),
  }

  return (
    <>
      <article className={`q-card${editorial ? ' q-card--editorial' : ''}`}>
        <button
          type="button"
          className="q-expand-btn"
          title="Expand to full width"
          onClick={() => setExpanded(true)}
          aria-label="Expand question"
        >
          <Maximize2 size={16} strokeWidth={2} aria-hidden />
        </button>
        <QuestionCardBody {...sharedProps} />
      </article>

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = searchParams.get('q') ?? ''
  const { isSaved, toggleSaved } = useSavedQuestions()

  const updateSearchQuery = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams.toString())
      const t = value.trim()
      if (t) next.set('q', t)
      else next.delete('q')
      const qs = next.toString()
      router.replace(qs ? `?${qs}` : '?', { scroll: false })
    },
    [searchParams, router],
  )

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
    geminiApiKey: readDefaultGeminiKeyFromEnv(),
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
    return allQuestions.filter((question) => {
      if (company && !question.companies.includes(company)) return false
      if (difficulty && question.difficulty !== difficulty) return false
      if (category && question.category !== category) return false
      if (!questionMatchesSearchQuery(question, search)) return false
      return true
    })
  }, [search, company, difficulty, category, allQuestions])

  const clearFilters = useCallback(() => {
    router.replace('?', { scroll: false })
    setCompany(null)
    setDifficulty(null)
    setCategory(null)
  }, [router])

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

  const selectedCompanyTotal = company
    ? allQuestions.filter((q) => q.companies.includes(company)).length
    : 0

  const companiesSorted = useMemo(
    () => [...COMPANIES].sort((a, b) => a.id.localeCompare(b.id)),
    [],
  )

  const railTopic =
    category ?? CATEGORIES[0] ?? ''

  return (
    <div className="editorial-page editorial-page--questions editorial-page--questions-stitch">
      <header className="questions-stitch-hero">
        <div className="questions-stitch-hero-primary">
          <div className="questions-stitch-kicker">
            <Terminal className="questions-stitch-kicker-icon" size={16} strokeWidth={2} aria-hidden />
            {ui.questions.heroKicker}
          </div>
          <h1 className="questions-stitch-hero-title">
            {ui.questions.heroTitleLine1}
            <br />
            <span className="questions-stitch-hero-accent">{ui.pages.questionsTitle}</span>
          </h1>
        </div>
        <p className="questions-stitch-hero-lead">{ui.questions.heroLead}</p>
      </header>

      <section className="questions-stitch-filter-band" aria-label={ui.questions.searchPlaceholder}>
        <div className="questions-stitch-filter-inner">
          <div className="questions-stitch-filter-controls">
            <div className="questions-stitch-search-field">
              <FilterSearchBar
                showSearchIcon
                placeholder={ui.questions.searchPlaceholder}
                value={search}
                onChange={updateSearchQuery}
                showClear={Boolean(search.trim())}
                onClear={() => updateSearchQuery('')}
                clearLabel={ui.questions.clearSearch}
                className="questions-stitch-search-adapter"
              />
            </div>
            <select
              className="questions-stitch-select"
              aria-label={ui.questions.difficulty}
              value={difficulty ?? ''}
              onChange={(e) => {
                const v = e.target.value
                setDifficulty(v === '' ? null : (v as Difficulty))
              }}
            >
              <option value="">{ui.questions.filterDifficultyAll}</option>
              <option value="easy">{ui.questions.difficultyFoundational}</option>
              <option value="medium">{ui.questions.difficultyIntermediate}</option>
              <option value="hard">{ui.questions.difficultyArchitectural}</option>
            </select>
            <select
              className="questions-stitch-select"
              aria-label={ui.questions.category}
              value={category ?? ''}
              onChange={(e) => {
                const v = e.target.value
                setCategory(v === '' ? null : (v as Category))
              }}
            >
              <option value="">{ui.questions.filterCategoryAll}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              className="questions-stitch-select"
              aria-label={ui.questions.company}
              value={company ?? ''}
              onChange={(e) => {
                const v = e.target.value
                setCompany(v === '' ? null : v)
              }}
            >
              <option value="">{ui.questions.filterCompanyAll}</option>
              {companiesSorted.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </div>
          <div className="questions-stitch-filter-meta">
            <ListFilter className="questions-stitch-filter-meta-icon" size={20} strokeWidth={2} aria-hidden />
            <span className="questions-stitch-filter-meta-text">
              {ui.questions.displayingQuestions.replace('{count}', String(filtered.length))}
            </span>
            {hasFilters && (
              <button type="button" className="questions-stitch-clear" onClick={clearFilters}>
                {ui.questions.clearFilters}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="questions-stitch-body">
        <div className="questions-stitch-main">
          {company && (
            <div className="questions-cqa-stream-head questions-stitch-stream-head">
              <h2 className="questions-cqa-stream-title">
                {ui.questions.featuredPrefix} {company}
              </h2>
              <button type="button" className="questions-cqa-view-all" onClick={() => setCompany(null)}>
                {ui.questions.viewAllQuestionsCta.replace('{count}', String(selectedCompanyTotal))}
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="q-empty">{ui.questions.emptyState}</div>
          ) : (
            <>
              <div className="questions-stitch-list">
                {filtered.map((q) => (
                  <QuestionCard
                    key={q.id}
                    editorial
                    q={q}
                    apiKey={chatApiKey}
                    model={chatModel}
                    llmProvider={aiSettings.provider}
                    isCustom={customIds.has(q.id)}
                    ui={ui}
                    searchQuery={search.trim() ? search : undefined}
                    onDeleteCustom={
                      customIds.has(q.id) ? () => removeCustomQuestion(q.id) : undefined
                    }
                    serverBookmarked={isSaved(q.id)}
                    onServerToggleBookmark={() => toggleSaved(q.id, q.category)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="questions-stitch-rail" aria-label={ui.questions.learningPathsTitle}>
          <div className="questions-stitch-rail-card">
            <h4 className="questions-stitch-rail-title">{ui.questions.learningPathsTitle}</h4>
            <div className="questions-stitch-rail-track">
              <div className="questions-stitch-rail-node questions-stitch-rail-node--current">
                <p className="questions-stitch-rail-kicker">{ui.questions.learningCurrentLabel}</p>
                <p className="questions-stitch-rail-body">{railTopic}</p>
                <p className="questions-stitch-rail-meta">
                  {ui.questions.stitchRailProgress
                    .replace('{visible}', String(filtered.length))
                    .replace('{total}', String(allQuestions.length))}
                </p>
              </div>
              <div className="questions-stitch-rail-node">
                <p className="questions-stitch-rail-kicker">{ui.questions.learningUpNextLabel}</p>
                <p className="questions-stitch-rail-body-muted">{ui.questions.learningUpNextHint}</p>
              </div>
            </div>
            <div className="questions-stitch-rail-promo">
              <p className="questions-stitch-rail-promo-kicker">{ui.questions.learningProKicker}</p>
              <p className="questions-stitch-rail-promo-title">{ui.questions.learningProTitle}</p>
              <Link className="questions-stitch-rail-promo-btn" href={PATH_FOR_PAGE.sandbox}>
                {ui.questions.learningLaunchEditor}
              </Link>
            </div>
          </div>
        </aside>
      </div>

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
    </div>
  )
}
